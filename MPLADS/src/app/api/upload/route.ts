import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    // Server-side file validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 5 MB limit." },
        { status: 400 }
      );
    }

    const mimeType = file.type.toLowerCase();
    const extension = path.extname(file.name).toLowerCase() || (mimeType.includes("png") ? ".png" : mimeType.includes("webp") ? ".webp" : ".jpg");

    if (!ALLOWED_TYPES.includes(mimeType) && !['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
      return NextResponse.json(
        { success: false, error: "Invalid file format. Please upload a JPG, PNG, or WEBP image." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename to prevent directory traversal or unsafe characters
    const timestamp = Date.now();
    const randomHash = Math.random().toString(36).substring(2, 8);
    const safeName = `evidence-${timestamp}-${randomHash}${extension}`;

    // Path inside public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, safeName);
      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${safeName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: safeName,
        originalName: file.name,
        sizeBytes: file.size,
      });
    } catch (fsErr) {
      console.warn("Local storage directory fallback triggered:", fsErr);

      // Portable Data URL fallback if filesystem writes are restricted
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mimeType || "image/jpeg"};base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename: safeName,
        originalName: file.name,
        sizeBytes: file.size,
      });
    }
  } catch (err: any) {
    console.error("Upload handler exception:", err);
    return NextResponse.json(
      { success: false, error: "Image upload failed. Please try again." },
      { status: 500 }
    );
  }
}

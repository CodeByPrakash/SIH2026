import { NextResponse } from "next/server";
import { extractPhotoMetadata } from "@/lib/exif";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo");

    if (!photo || !(photo instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid image file provided. Please attach a photo in the 'photo' field.",
        },
        { status: 400 }
      );
    }

    // 1. File type validation
    const fileType = photo.type.toLowerCase();
    const ext = photo.name.split(".").pop()?.toLowerCase() || "";
    const isAllowedType =
      ALLOWED_MIME_TYPES.includes(fileType) ||
      ["jpg", "jpeg", "png", "webp"].includes(ext);

    if (!isAllowedType) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unsupported file type. Only JPEG, PNG, and WEBP images are allowed.",
        },
        { status: 400 }
      );
    }

    // 2. File size validation
    if (photo.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(photo.size / (1024 * 1024)).toFixed(
            2
          )} MB) exceeds the maximum allowed limit of 5 MB.`,
        },
        { status: 400 }
      );
    }

    // 3. Extract EXIF metadata
    const buffer = Buffer.from(await photo.arrayBuffer());
    const metadata = await extractPhotoMetadata(buffer);

    return NextResponse.json({
      success: true,
      data: {
        fileName: photo.name,
        fileType: photo.type || `image/${ext}`,
        fileSize: photo.size,
        latitude: metadata.latitude,
        longitude: metadata.longitude,
        capturedAt: metadata.capturedAt,
        hasGps: metadata.hasGps,
        hasTimestamp: metadata.hasTimestamp,
      },
    });
  } catch (error: any) {
    console.error("[API /api/evidence/metadata] Extraction error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process photo metadata. The image file may be corrupted.",
      },
      { status: 500 }
    );
  }
}

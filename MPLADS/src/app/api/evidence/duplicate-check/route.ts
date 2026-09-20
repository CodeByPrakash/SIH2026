import { NextResponse } from "next/server";
import { checkImageReuse } from "@/lib/duplicateDetection";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo") || formData.get("image");
    const projectId =
      (formData.get("projectId") as string) ||
      (formData.get("currentProjectId") as string) ||
      undefined;
    const currentEvidenceId =
      (formData.get("currentEvidenceId") as string) || undefined;

    if (!photo || !(photo instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No valid image file provided. Please attach a photo in the 'photo' field.",
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

    // 3. Extract buffer & run duplicate check
    const buffer = Buffer.from(await photo.arrayBuffer());
    const duplicateResult = await checkImageReuse({
      buffer,
      projectId,
      currentEvidenceId,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...duplicateResult,
        similarityPercent: duplicateResult.similarityScore ?? 0,
      },
    });
  } catch (error: any) {
    console.error("[API /api/evidence/duplicate-check] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform duplicate evidence check.",
      },
      { status: 500 }
    );
  }
}

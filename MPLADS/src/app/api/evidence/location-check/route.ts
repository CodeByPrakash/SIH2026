import { NextResponse } from "next/server";
import { getProjectById } from "@/services/project.service";
import { verifyPhotoLocation } from "@/lib/locationVerification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, latitude, longitude, allowedRadiusMeters } = body;

    // 1. Validate projectId
    if (!projectId || typeof projectId !== "string" || !projectId.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'projectId'." },
        { status: 400 }
      );
    }

    // 2. Validate coordinates range if provided
    if (latitude !== undefined && latitude !== null) {
      if (
        typeof latitude !== "number" ||
        isNaN(latitude) ||
        !isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid photo latitude. Latitude must be a valid number between -90 and 90.",
          },
          { status: 400 }
        );
      }
    }

    if (longitude !== undefined && longitude !== null) {
      if (
        typeof longitude !== "number" ||
        isNaN(longitude) ||
        !isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid photo longitude. Longitude must be a valid number between -180 and 180.",
          },
          { status: 400 }
        );
      }
    }

    // 3. Server-side project lookup
    const project = await getProjectById(projectId.trim());
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: `Project with ID '${projectId}' was not found in records.`,
        },
        { status: 404 }
      );
    }

    // 4. Verify photo location against server-retrieved project coordinates
    const verification = verifyPhotoLocation({
      photoLocation: {
        latitude: typeof latitude === "number" ? latitude : null,
        longitude: typeof longitude === "number" ? longitude : null,
      },
      projectLocation: {
        latitude: typeof project.geoLat === "number" ? project.geoLat : null,
        longitude: typeof project.geoLng === "number" ? project.geoLng : null,
      },
      allowedRadiusMeters:
        typeof allowedRadiusMeters === "number" ? allowedRadiusMeters : undefined,
    });

    return NextResponse.json({
      success: true,
      data: verification,
    });
  } catch (error: any) {
    console.error("[API /api/evidence/location-check] Verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform location verification.",
      },
      { status: 500 }
    );
  }
}

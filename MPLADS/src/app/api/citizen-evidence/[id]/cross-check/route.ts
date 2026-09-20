import { NextResponse } from "next/server";
import { getEvidenceById } from "@/services/citizenEvidence.service";
import { getProjectById } from "@/services/project.service";
import { getAllEvidence } from "@/services/citizenEvidence.service";
import { runEvidenceCrossCheck } from "@/services/evidenceCrossCheck.service";
import { dbConnect } from "@/lib/mongodb";
import { CitizenEvidenceModel } from "@/models/CitizenEvidence";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const evidence = await getEvidenceById(id);

    if (!evidence) {
      return NextResponse.json(
        { success: false, error: `Evidence item ${id} not found` },
        { status: 404 }
      );
    }

    const project = await getProjectById(evidence.projectId);
    const allEvidence = await getAllEvidence();

    const crossCheckResult = runEvidenceCrossCheck(
      {
        evidenceId: evidence.evidenceId,
        projectId: evidence.projectId,
        description: evidence.description,
        category: evidence.category,
        location: evidence.location,
        photoUrl: body.photoUrl || evidence.photoUrl,
        photoName: body.photoName,
        photoLatitude: typeof body.photoLatitude === "number" ? body.photoLatitude : evidence.photoLatitude,
        photoLongitude: typeof body.photoLongitude === "number" ? body.photoLongitude : evidence.photoLongitude,
        photoTimestamp: body.photoTimestamp || evidence.photoTimestamp,
      },
      project,
      allEvidence
    );

    // Persist updated cross-check result to MongoDB Atlas
    const conn = await dbConnect();
    if (conn) {
      await CitizenEvidenceModel.findOneAndUpdate(
        { evidenceId: id },
        {
          $set: {
            imageHash: crossCheckResult.imageHash,
            perceptualHash: crossCheckResult.perceptualHash,
            photoLatitude: crossCheckResult.photoLatitude,
            photoLongitude: crossCheckResult.photoLongitude,
            photoTimestamp: crossCheckResult.photoTimestamp || "",
            geoStatus: crossCheckResult.geoStatus,
            duplicateStatus: crossCheckResult.duplicateStatus,
            crossProjectReuse: crossCheckResult.crossProjectReuse,
            similarEvidenceId: crossCheckResult.similarEvidenceId || "",
            similarProjectId: crossCheckResult.similarProjectId || "",
            similarProjectName: crossCheckResult.similarProjectName || "",
            similarityScore: crossCheckResult.similarityScore,
            locationDistanceKm: crossCheckResult.locationDistanceKm,
            timestampStatus: crossCheckResult.timestampStatus,
            visualConsistencyStatus: crossCheckResult.visualConsistencyStatus,
            verificationResultStatus: crossCheckResult.verificationResultStatus,
            verificationFlags: crossCheckResult.verificationFlags,
            overallAssessment: crossCheckResult.overallAssessment,
            verificationProcessedAt: new Date().toISOString(),
          },
        },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...evidence,
        ...crossCheckResult,
      },
    });
  } catch (error: any) {
    console.error("POST /api/citizen-evidence/[id]/cross-check error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Cross-check failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getEvidenceById } from "@/services/citizenEvidence.service";
import { getProjectById } from "@/services/project.service";
import { runAICrossCheck } from "@/services/evidenceVerification.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getEvidenceById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: "Evidence record not found" }, { status: 404 });
    }

    const project = await getProjectById(item.projectId);
    const result = runAICrossCheck(project, {
      category: item.category,
      description: item.description,
      location: item.location,
      evidenceType: item.evidenceType,
    });

    return NextResponse.json({
      success: true,
      data: {
        evidenceId: item.evidenceId,
        projectId: item.projectId,
        ...result,
        privacyStatus: "Protected",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/citizen-evidence/[id]/verify error:", error);
    return NextResponse.json({ success: false, error: "Failed to run AI verification" }, { status: 500 });
  }
}

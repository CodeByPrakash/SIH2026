import { NextResponse } from "next/server";
import {
  recordAuthorityDecision,
  getAuthorityDecisionsForProject,
} from "@/services/interventionSimulation.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decisions = await getAuthorityDecisionsForProject(id);
    return NextResponse.json({ success: true, data: decisions });
  } catch (error: any) {
    console.error("GET /api/projects/[id]/decision error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch authority decisions" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.selectedIntervention || !body.decisionNote || !body.userRole) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (selectedIntervention, decisionNote, userRole)",
        },
        { status: 400 }
      );
    }

    // Role check: Citizen should not execute administrative decisions
    if (body.userRole === "Citizen") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Citizens cannot record official administrative decisions.",
        },
        { status: 403 }
      );
    }

    const decisionRecord = await recordAuthorityDecision({
      projectId: id,
      selectedIntervention: body.selectedIntervention,
      decisionNote: body.decisionNote,
      recordedByRole: body.userRole,
      recordedByName: body.userName,
      simulationIdRef: body.simulationId,
    });

    return NextResponse.json({
      success: true,
      data: decisionRecord,
    });
  } catch (error: any) {
    console.error("POST /api/projects/[id]/decision error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to record authority decision" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { runInterventionSimulation } from "@/services/interventionSimulation.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const targetProjectId = id || body.projectId;

    if (!targetProjectId) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      );
    }

    const customInputs = body.customInputs || body.whatIf || undefined;
    const simulationResult = await runInterventionSimulation(targetProjectId, customInputs);

    return NextResponse.json({
      success: true,
      data: simulationResult,
    });
  } catch (error: any) {
    console.error("POST /api/projects/[id]/simulate error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to run intervention simulation" },
      { status: 500 }
    );
  }
}

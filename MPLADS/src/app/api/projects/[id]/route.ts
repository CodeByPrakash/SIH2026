import { NextResponse } from "next/server";
import { getProjectById, updateProject } from "@/services/project.service";
import { createAlert } from "@/services/alert.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await getProjectById(id);

    if (!existing) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const updated = await updateProject(id, body);

    // Auto-generate Alert if project status changes to Delayed or riskLevel escalates
    if (body.status === "Delayed" && existing.status !== "Delayed") {
      await createAlert({
        id: `ALT-DLY-${Date.now().toString().slice(-6)}`,
        title: `Project Status Changed to Delayed: ${existing.name}`,
        description: `Project ${id} in ${existing.district}, ${existing.state} has breached schedule deadline.`,
        type: "Delay",
        severity: "High",
        projectId: id,
        state: existing.state,
        district: existing.district,
        createdAt: new Date().toISOString().split("T")[0],
        actionRequired: "Issue show-cause notice to contractor and review project timeline.",
        status: "Active",
      });
    } else if (body.riskLevel === "Critical" && existing.riskLevel !== "Critical") {
      await createAlert({
        id: `ALT-RSK-${Date.now().toString().slice(-6)}`,
        title: `Critical Risk Escalation: ${existing.name}`,
        description: `Risk score escalated for project ${id} in ${existing.district}.`,
        type: "Anomaly",
        severity: "Critical",
        projectId: id,
        state: existing.state,
        district: existing.district,
        createdAt: new Date().toISOString().split("T")[0],
        actionRequired: "Conduct immediate site inspection and physical audit.",
        status: "Active",
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/projects/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update project" }, { status: 500 });
  }
}

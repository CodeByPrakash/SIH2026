import { NextResponse } from "next/server";
import { updateAlertStatus } from "@/services/alert.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.status || !["Active", "Acknowledged", "Resolved"].includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }
    const updated = await updateAlertStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Alert not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/alerts/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update alert" }, { status: 500 });
  }
}

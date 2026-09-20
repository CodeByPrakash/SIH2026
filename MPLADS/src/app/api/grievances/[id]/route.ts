import { NextResponse } from "next/server";
import { getGrievanceById, updateGrievanceStatus } from "@/services/grievance.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getGrievanceById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: "Grievance not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/grievances/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch grievance" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.status || !["Open", "Under Review", "Resolved"].includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }
    const updated = await updateGrievanceStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Grievance not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/grievances/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to update grievance" }, { status: 500 });
  }
}

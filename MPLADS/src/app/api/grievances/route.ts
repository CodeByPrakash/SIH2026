import { NextResponse } from "next/server";
import { getAllGrievances, createGrievance } from "@/services/grievance.service";

export async function GET() {
  try {
    const grievances = await getAllGrievances();
    return NextResponse.json({ success: true, data: grievances, count: grievances.length });
  } catch (error) {
    console.error("GET /api/grievances error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch grievances" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.mobile || !body.district || !body.category || !body.desc) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (name, mobile, district, category, desc)" },
        { status: 400 }
      );
    }
    const created = await createGrievance(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/grievances error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit grievance" }, { status: 500 });
  }
}

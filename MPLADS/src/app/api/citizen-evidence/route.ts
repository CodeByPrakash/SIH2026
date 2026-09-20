import { NextResponse } from "next/server";
import { getAllEvidence, createEvidence } from "@/services/citizenEvidence.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || undefined;
    const items = await getAllEvidence(role as any);
    return NextResponse.json({ success: true, data: items, count: items.length });
  } catch (error) {
    console.error("GET /api/citizen-evidence error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch evidence records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.projectId || !body.category || !body.description || !body.location) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (projectId, category, description, location)" },
        { status: 400 }
      );
    }
    const created = await createEvidence(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/citizen-evidence error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit citizen evidence" }, { status: 500 });
  }
}

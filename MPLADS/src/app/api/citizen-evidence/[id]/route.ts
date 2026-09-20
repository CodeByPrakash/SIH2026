import { NextResponse } from "next/server";
import { getEvidenceById } from "@/services/citizenEvidence.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getEvidenceById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: "Evidence record not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/citizen-evidence/[id] error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch evidence record" }, { status: 500 });
  }
}

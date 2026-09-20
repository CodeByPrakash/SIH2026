import { NextResponse } from "next/server";
import { getAllAlerts, createAlert } from "@/services/alert.service";

export async function GET() {
  try {
    const alerts = await getAllAlerts();
    return NextResponse.json({ success: true, data: alerts, count: alerts.length });
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.description || !body.type || !body.severity) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, description, type, severity)" },
        { status: 400 }
      );
    }
    const alert = {
      id: body.id || `ALT-${Date.now().toString().slice(-6)}`,
      title: body.title,
      description: body.description,
      type: body.type,
      severity: body.severity,
      projectId: body.projectId || "",
      state: body.state || "",
      district: body.district || "",
      createdAt: body.createdAt || new Date().toISOString().split("T")[0],
      daysRemaining: body.daysRemaining,
      actionRequired: body.actionRequired || "",
      status: body.status || "Active",
    };
    const created = await createAlert(alert);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/alerts error:", error);
    return NextResponse.json({ success: false, error: "Failed to create alert" }, { status: 500 });
  }
}

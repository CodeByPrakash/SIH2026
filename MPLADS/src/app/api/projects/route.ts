import { NextResponse } from "next/server";
import { getAllProjects, createProject } from "@/services/project.service";

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ success: true, data: projects, count: projects.length });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.id || !body.name || !body.state || !body.district) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (id, name, state, district)" },
        { status: 400 }
      );
    }
    const newProject = await createProject(body);
    return NextResponse.json({ success: true, data: newProject }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
  }
}

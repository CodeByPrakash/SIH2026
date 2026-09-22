import { NextResponse } from "next/server";
import { getAllProjects, getPaginatedProjects, createProject, isLastQueryFromCache } from "@/services/project.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district") || undefined;
    const state = searchParams.get("state") || undefined;
    const constituency = searchParams.get("constituency") || undefined;
    const status = searchParams.get("status") || undefined;
    const riskLevel = searchParams.get("riskLevel") || undefined;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const searchParam = searchParams.get("search");
    const force = searchParams.get("force") === "true";
    const lightweight = searchParams.get("lightweight") === "true" || pageParam !== null || searchParam !== null;

    const isPaginatedCall = pageParam !== null || limitParam !== null || searchParam !== null;

    if (isPaginatedCall) {
      const page = pageParam ? parseInt(pageParam, 10) : 1;
      const limit = limitParam ? parseInt(limitParam, 10) : 10;
      const search = searchParam || undefined;

      const result = await getPaginatedProjects({
        district,
        state,
        constituency,
        status,
        riskLevel,
        page,
        limit,
        search,
        forceRefresh: force,
        lightweight,
      });

      const isCached = isLastQueryFromCache();

      return NextResponse.json(
        {
          success: true,
          data: result.projects,
          projects: result.projects,
          count: result.projects.length,
          cached: isCached,
          pagination: result.pagination,
        },
        {
          status: 200,
          headers: {
            "Cache-Control": force
              ? "no-cache, no-store, must-revalidate"
              : "public, s-maxage=30, stale-while-revalidate=60",
            "X-Cache-Status": isCached ? "HIT" : "MISS",
          },
        }
      );
    }

    const projects = await getAllProjects({
      district,
      state,
      constituency,
      status,
      riskLevel,
      limit: limitParam ? parseInt(limitParam, 10) : undefined,
      forceRefresh: force,
    });

    const isCached = isLastQueryFromCache();

    return NextResponse.json(
      {
        success: true,
        data: projects,
        projects: projects,
        count: projects.length,
        cached: isCached,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": force
            ? "no-cache, no-store, must-revalidate"
            : "public, s-maxage=30, stale-while-revalidate=60",
          "X-Cache-Status": isCached ? "HIT" : "MISS",
        },
      }
    );
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

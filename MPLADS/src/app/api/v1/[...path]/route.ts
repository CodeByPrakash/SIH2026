/**
 * Next.js App Router Proxy -> Python FastAPI Backend
 *
 * Forwards all  /api/v1/*  requests to MODEL_API_URL (the FastAPI server).
 * This is required because Next.js intercepts /api/* before rewrites fire
 * when src/app/api/ exists.
 */

import { type NextRequest, NextResponse } from "next/server";

const MODEL_API_URL =
  process.env.MODEL_API_URL ?? "http://localhost:8000";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const upstream = `${MODEL_API_URL}/api/v1/${path.join("/")}`;

  const { search } = new URL(req.url);
  const target = search ? `${upstream}${search}` : upstream;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method)
      ? undefined
      : await req.arrayBuffer(),
  };

  try {
    const upstreamRes = await fetch(target, init);
    const body = await upstreamRes.arrayBuffer();

    return new NextResponse(body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: {
        "content-type":
          upstreamRes.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    console.error("[proxy] FastAPI backend unreachable:", target, err);
    return NextResponse.json(
      { detail: "AI inference backend is offline or unreachable." },
      { status: 503 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

import { NextResponse } from "next/server";
import { buildContext } from "@/lib/chatbot/buildContext";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const rawMessage = body?.message;
    const currentRoute = body?.currentRoute || "/dashboard";
    const user = body?.user || null;

    // Validate request input
    if (!rawMessage || typeof rawMessage !== "string" || !rawMessage.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Message is required.",
        },
        { status: 400 }
      );
    }

    const trimmedMessage = rawMessage.trim();

    // Dynamically build website & live database context server-side
    const contextualMessage = await buildContext({
      message: trimmedMessage,
      currentRoute,
      user,
    });

    const targetUrl = process.env.DEEPBOT_API_URL;
    if (!targetUrl) {
      console.error("[Chat API Proxy] DEEPBOT_API_URL is not defined in environment variables");
      return NextResponse.json(
        {
          success: false,
          message: "Chatbot service is misconfigured.",
        },
        { status: 500 }
      );
    }

    // Setup timeout signal (15 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let externalRes: Response;
    try {
      externalRes = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: contextualMessage }),
        signal: controller.signal,
      });
    } catch (networkError: any) {
      clearTimeout(timeoutId);
      console.error("[Chat API Proxy] Network/Timeout error:", networkError?.message);
      return NextResponse.json(
        {
          success: false,
          message: "Unable to connect to the chatbot service.",
        },
        { status: 503 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle non-2xx HTTP errors from external backend
    if (!externalRes.ok) {
      console.error(
        `[Chat API Proxy] External service error status ${externalRes.status}`
      );
      return NextResponse.json(
        {
          success: false,
          message: "Chatbot service is temporarily unavailable.",
        },
        { status: externalRes.status >= 500 ? 502 : 400 }
      );
    }

    // Parse external JSON response safely
    const responseData = await externalRes.json().catch(() => null);

    // DeepBot backend returns: { success: true, data: { reply: "..." } }
    const botReply =
      responseData?.data?.reply ||
      responseData?.data?.message ||
      responseData?.reply ||
      responseData?.message;

    if (!botReply || typeof botReply !== "string") {
      console.error(
        "[Chat API Proxy] Unexpected response structure from DeepBot:",
        JSON.stringify(responseData)
      );
      return NextResponse.json(
        {
          success: false,
          message: "The chatbot returned an unexpected response.",
        },
        { status: 502 }
      );
    }

    // Return normalized response to frontend
    return NextResponse.json({
      success: true,
      data: {
        message: botReply,
      },
    });
  } catch (err: any) {
    console.error("[Chat API Proxy] Internal error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the chatbot service.",
      },
      { status: 500 }
    );
  }
}

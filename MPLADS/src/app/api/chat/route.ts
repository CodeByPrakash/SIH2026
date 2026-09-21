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
          error: "Message is required.",
          message: "Message is required.",
        },
        { status: 400 }
      );
    }

    const trimmedMessage = rawMessage.trim();

    // Check server-side environment variable for DeepBot API URL
    const targetUrl = process.env.DEEPBOT_API_URL;
    if (!targetUrl) {
      console.error("[Chatbot API Proxy] DEEPBOT_API_URL environment variable is missing on server.");
      return NextResponse.json(
        {
          success: false,
          error: "Chatbot service is not configured",
          message: "Chatbot service is not configured",
        },
        { status: 500 }
      );
    }

    // Dynamically build user-aware & website-aware context server-side
    const contextualMessage = await buildContext({
      message: trimmedMessage,
      currentRoute,
      user,
    });

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
      console.error("[Chatbot API Proxy] Network or timeout error connecting to DeepBot:", networkError?.message || networkError);
      return NextResponse.json(
        {
          success: false,
          error: "Network error",
          message: "Sorry, NIDHI-RAKSHAK AI is temporarily unavailable. Please try again.",
        },
        { status: 503 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle non-2xx HTTP errors from external backend
    if (!externalRes.ok) {
      console.error(`[Chatbot API Proxy] DeepBot backend HTTP error status ${externalRes.status}`);
      return NextResponse.json(
        {
          success: false,
          error: `HTTP ${externalRes.status}`,
          message: "Sorry, NIDHI-RAKSHAK AI is temporarily unavailable. Please try again.",
        },
        { status: externalRes.status >= 500 ? 502 : 400 }
      );
    }

    // Parse external JSON response safely
    const responseData = await externalRes.json().catch(() => null);

    // Normalize DeepBot response formats (reply, message, response, or data object)
    const botReply =
      responseData?.reply ||
      responseData?.message ||
      responseData?.response ||
      responseData?.data?.reply ||
      responseData?.data?.message ||
      responseData?.data?.response;

    if (!botReply || typeof botReply !== "string") {
      console.error(
        "[Chatbot API Proxy] Unexpected or empty response structure from DeepBot:",
        JSON.stringify(responseData)
      );
      return NextResponse.json(
        {
          success: false,
          error: "Invalid backend response format",
          message: "Sorry, NIDHI-RAKSHAK AI is temporarily unavailable. Please try again.",
        },
        { status: 502 }
      );
    }

    // Return normalized response format { reply: "..." }
    return NextResponse.json({
      success: true,
      reply: botReply,
      data: {
        reply: botReply,
        message: botReply,
      },
    });
  } catch (err: any) {
    console.error("[Chatbot API Proxy] Internal server exception:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Sorry, NIDHI-RAKSHAK AI is temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}

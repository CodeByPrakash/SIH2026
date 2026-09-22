import { NextResponse } from "next/server";
import { buildContext } from "@/lib/chatbot/buildContext";

// In-Memory Chat Response Cache for faster AI conversation & reduced backend load
interface ChatCacheEntry {
  reply: string;
  timestamp: number;
}
const chatResponseCache = new Map<string, ChatCacheEntry>();
const CHAT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const rawMessage = body?.message;
    const currentRoute = body?.currentRoute || "/dashboard";
    const user = body?.user || null;
    const auditContext = body?.auditContext || null;
    const mode = body?.mode || "general";
    const history = Array.isArray(body?.history) ? body.history : [];

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

    // Cache lookup for rapid response
    const cacheKey = [
      user?.name || "guest",
      user?.role || "",
      user?.district || user?.constituency || user?.state || "",
      mode,
      auditContext?.project?.id || "",
      trimmedMessage.toLowerCase(),
    ].join("|");

    if (chatResponseCache.has(cacheKey)) {
      const cached = chatResponseCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CHAT_CACHE_TTL_MS) {
        return NextResponse.json({
          success: true,
          reply: cached.reply,
          data: {
            reply: cached.reply,
            message: cached.reply,
            cached: true,
          },
          cached: true,
        });
      }
    }

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
      auditContext,
      mode,
      history,
    });

    // Setup timeout signal (30 seconds for deep ML analysis)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
      console.error("[Chatbot API Proxy] Network or timeout error connecting to Nidhi-saathi:", networkError?.message || networkError);
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
      console.error(`[Chatbot API Proxy] Nidhi-saathi backend HTTP error status ${externalRes.status}`);
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

    // Normalize Nidhi-saathi response formats (reply, message, response, or data object)
    const botReply =
      responseData?.reply ||
      responseData?.message ||
      responseData?.response ||
      responseData?.data?.reply ||
      responseData?.data?.message ||
      responseData?.data?.response;

    if (!botReply || typeof botReply !== "string") {
      console.error(
        "[Chatbot API Proxy] Unexpected or empty response structure from Nidhi-saathi:",
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

    // Cache response for future instant queries
    chatResponseCache.set(cacheKey, {
      reply: botReply,
      timestamp: Date.now(),
    });

    // Return normalized response format
    return NextResponse.json({
      success: true,
      reply: botReply,
      data: {
        reply: botReply,
        message: botReply,
        cached: false,
      },
      cached: false,
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

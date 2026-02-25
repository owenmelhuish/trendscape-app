import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { detectTrends } from "@/lib/engine/trend-detector";

export async function POST(request: Request) {
  try {
    const { brandId } = await request.json();
    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // SSE streaming for progress
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (message: string) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "progress", message })}\n\n`)
          );
        };

        try {
          const result = await detectTrends(supabase, brandId, emit);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "complete", ...result })}\n\n`
            )
          );

          // Auto-trigger analysis for high-scoring trends
          if (result.autoAnalyzeIds.length > 0) {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}` || "http://localhost:3000";
            for (const trendId of result.autoAnalyzeIds) {
              fetch(`${baseUrl}/api/trends/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trendId, brandId }),
              }).catch(console.error);
            }
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: String(error) })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Trend detection error:", error);
    return NextResponse.json(
      { error: "Trend detection failed" },
      { status: 500 }
    );
  }
}

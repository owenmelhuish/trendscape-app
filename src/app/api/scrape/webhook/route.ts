import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchRunResults, mapTikTokResult } from "@/lib/scraper/tiktok-actor";
import { scoreItem } from "@/lib/engine/virality-scorer";
import type { RawContent } from "@/types/content";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const brandId = searchParams.get("brandId");

    if (!jobId || !brandId) {
      return NextResponse.json({ error: "Missing jobId or brandId" }, { status: 400 });
    }

    const body = await request.json();
    const runId = body.resource?.id || body.runId;
    const eventType = body.eventType;

    const supabase = await createServiceClient();

    // Handle failure
    if (eventType === "ACTOR.RUN.FAILED") {
      await supabase
        .from("scrape_jobs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: "Apify actor run failed",
        })
        .eq("id", jobId);

      return NextResponse.json({ status: "failed" });
    }

    // Fetch results from Apify
    const results = await fetchRunResults(runId);

    // Map content and compute virality scores inline
    const mappedContent = results.map((r) => {
      const content = mapTikTokResult(r, brandId, jobId);
      const scores = scoreItem(content as unknown as RawContent);
      return { ...content, virality_score: scores.virality_score, engagement_rate: scores.engagement_rate };
    });

    let itemsInserted = 0;
    // Batch upsert in chunks of 50
    for (let i = 0; i < mappedContent.length; i += 50) {
      const chunk = mappedContent.slice(i, i + 50);
      const { data, error } = await supabase
        .from("raw_content")
        .upsert(chunk, {
          onConflict: "brand_id,platform,post_id",
          ignoreDuplicates: false,
        })
        .select("id");

      if (!error && data) {
        itemsInserted += data.length;
      }
    }

    // Update job as completed
    await supabase
      .from("scrape_jobs")
      .update({
        status: "completed",
        items_found: itemsInserted,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    // Auto-trigger trend detection after successful scrape
    const detectUrl = `${process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}` || "http://localhost:3000"}/api/trends/detect`;
    fetch(detectUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId }),
    }).catch(console.error); // Fire and forget

    return NextResponse.json({ status: "completed", itemsInserted });
  } catch (error) {
    console.error("Scrape webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { waitForRun, fetchRunResults, mapTikTokResult } from "@/lib/scraper/tiktok-actor";
import { scoreItem } from "@/lib/engine/virality-scorer";
import type { RawContent } from "@/types/content";

export async function POST(request: Request) {
  try {
    const { jobId, brandId } = await request.json();
    if (!jobId || !brandId) {
      return NextResponse.json({ error: "jobId and brandId are required" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Look up the scrape job
    const { data: job, error: jobError } = await supabase
      .from("scrape_jobs")
      .select("apify_run_id, status")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Scrape job not found" }, { status: 404 });
    }

    if (job.status === "completed") {
      return NextResponse.json({ status: "completed" });
    }
    if (job.status === "failed") {
      return NextResponse.json({ status: "failed" });
    }
    if (!job.apify_run_id) {
      return NextResponse.json({ status: "running" });
    }

    // Long-poll Apify (55s safe under Vercel 60s limit)
    const result = await waitForRun(job.apify_run_id, 55);

    if (result.status === "SUCCEEDED") {
      // Fetch results, score, and store them
      const results = await fetchRunResults(job.apify_run_id);
      const mappedContent = results.map((r) => {
        const content = mapTikTokResult(r, brandId, jobId);
        const scores = scoreItem(content as unknown as RawContent);
        return { ...content, virality_score: scores.virality_score, engagement_rate: scores.engagement_rate };
      });

      let itemsInserted = 0;
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

      // Fire-and-forget trigger to trend detection
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      fetch(`${baseUrl}/api/trends/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId }),
      }).catch(console.error);

      return NextResponse.json({ status: "completed", itemsInserted });
    }

    if (result.status === "FAILED" || result.status === "ABORTED" || result.status === "TIMED-OUT") {
      await supabase
        .from("scrape_jobs")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          error_message: `Apify run ${result.status}`,
        })
        .eq("id", jobId);

      return NextResponse.json({ status: "failed" });
    }

    // Still running (waitForFinish returned before completion)
    return NextResponse.json({ status: "running" });
  } catch (error) {
    console.error("Scrape poll error:", error);
    return NextResponse.json(
      { error: "Poll failed" },
      { status: 500 }
    );
  }
}

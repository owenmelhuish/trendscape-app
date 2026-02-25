import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchRunResults, mapTikTokResult } from "@/lib/scraper/tiktok-actor";

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: job, error: jobError } = await supabase
      .from("scrape_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job || !job.apify_run_id) {
      return NextResponse.json({ error: "Job not found or has no run ID" }, { status: 404 });
    }

    const results = await fetchRunResults(job.apify_run_id);
    const mappedContent = results.map((r) =>
      mapTikTokResult(r, job.brand_id, job.id)
    );

    let itemsInserted = 0;
    for (let i = 0; i < mappedContent.length; i += 50) {
      const chunk = mappedContent.slice(i, i + 50);
      const { data } = await supabase
        .from("raw_content")
        .upsert(chunk, {
          onConflict: "brand_id,platform,post_id",
          ignoreDuplicates: false,
        })
        .select("id");

      if (data) itemsInserted += data.length;
    }

    await supabase
      .from("scrape_jobs")
      .update({ items_found: itemsInserted })
      .eq("id", jobId);

    return NextResponse.json({ itemsInserted });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json({ error: "Ingest failed" }, { status: 500 });
  }
}

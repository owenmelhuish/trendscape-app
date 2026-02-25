import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { startTikTokScrape } from "@/lib/scraper/tiktok-actor";

export async function POST(request: Request) {
  try {
    const { brandId } = await request.json();
    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Get brand and its keywords
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("*")
      .eq("id", brandId)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    if (!brand.keywords?.length) {
      return NextResponse.json({ error: "Brand has no keywords configured" }, { status: 400 });
    }

    // Create scrape job record
    const { data: job, error: jobError } = await supabase
      .from("scrape_jobs")
      .insert({
        brand_id: brandId,
        platform: "tiktok",
        status: "pending",
        keywords_used: brand.keywords,
      })
      .select()
      .single();

    if (jobError) {
      return NextResponse.json({ error: "Failed to create scrape job" }, { status: 500 });
    }

    // Build webhook URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/scrape/webhook?jobId=${job.id}&brandId=${brandId}`;

    // Start Apify run
    const { runId } = await startTikTokScrape(brand.keywords, webhookUrl);

    // Update job with run ID and status
    await supabase
      .from("scrape_jobs")
      .update({ apify_run_id: runId, status: "running" })
      .eq("id", job.id);

    return NextResponse.json({ jobId: job.id, runId });
  } catch (error) {
    console.error("Scrape trigger error:", error);
    return NextResponse.json(
      { error: "Failed to trigger scrape" },
      { status: 500 }
    );
  }
}

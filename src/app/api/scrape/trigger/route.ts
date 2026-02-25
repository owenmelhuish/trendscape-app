import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { startTikTokScrape } from "@/lib/scraper/tiktok-actor";
import { INDUSTRY_TERMS } from "@/lib/constants";

/**
 * Merge brand keywords with top industry terms, avoiding duplicates.
 * Returns at most brandKeywords + 6 industry terms.
 */
function buildSearchTerms(brandKeywords: string[], industry: string): string[] {
  const brandLower = new Set(brandKeywords.map((k) => k.toLowerCase()));
  const industryTerms = INDUSTRY_TERMS[industry] || [];

  // Pick up to 6 industry terms that don't overlap with brand keywords
  const extraTerms: string[] = [];
  for (const term of industryTerms) {
    if (extraTerms.length >= 6) break;
    if (!brandLower.has(term.toLowerCase())) {
      extraTerms.push(term);
    }
  }

  return [...brandKeywords, ...extraTerms];
}

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

    // Merge brand keywords with industry terms for broader discovery
    const searchTerms = buildSearchTerms(brand.keywords, brand.industry);

    // Create scrape job record
    const { data: job, error: jobError } = await supabase
      .from("scrape_jobs")
      .insert({
        brand_id: brandId,
        platform: "tiktok",
        status: "pending",
        keywords_used: brand.keywords,
        search_terms: searchTerms,
      })
      .select()
      .single();

    if (jobError) {
      return NextResponse.json({ error: "Failed to create scrape job" }, { status: 500 });
    }

    // Build webhook URL (only for deployed environments)
    let webhookUrl: string | undefined;
    if (process.env.VERCEL_URL) {
      const baseUrl = `https://${process.env.VERCEL_URL}`;
      webhookUrl = `${baseUrl}/api/scrape/webhook?jobId=${job.id}&brandId=${brandId}`;
    }

    // Start Apify run with broader search terms
    const { runId } = await startTikTokScrape(searchTerms, webhookUrl);

    // Update job with run ID and status
    await supabase
      .from("scrape_jobs")
      .update({ apify_run_id: runId, status: "running" })
      .eq("id", job.id);

    return NextResponse.json({ jobId: job.id, runId, searchTerms });
  } catch (error) {
    console.error("Scrape trigger error:", error);
    return NextResponse.json(
      { error: "Failed to trigger scrape", detail: String(error) },
      { status: 500 }
    );
  }
}

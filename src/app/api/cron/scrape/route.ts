import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // Get all active brands
    const { data: brands, error } = await supabase
      .from("brands")
      .select("id, name, keywords")
      .eq("is_active", true);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}`;
    const results: Array<{ brandId: string; brandName: string; status: string }> = [];

    // Trigger scrape for each brand
    for (const brand of brands || []) {
      if (!brand.keywords?.length) {
        results.push({ brandId: brand.id, brandName: brand.name, status: "skipped_no_keywords" });
        continue;
      }

      try {
        const res = await fetch(`${baseUrl}/api/scrape/trigger`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandId: brand.id }),
        });

        results.push({
          brandId: brand.id,
          brandName: brand.name,
          status: res.ok ? "triggered" : "failed",
        });
      } catch {
        results.push({ brandId: brand.id, brandName: brand.name, status: "error" });
      }
    }

    return NextResponse.json({ triggered: results.length, results });
  } catch (error) {
    console.error("Cron scrape error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

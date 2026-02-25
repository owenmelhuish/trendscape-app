import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const VALID_SORT_FIELDS = ["virality_score", "views", "likes", "engagement_rate", "post_created_at"] as const;
type SortField = (typeof VALID_SORT_FIELDS)[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");
    const sortBy = (searchParams.get("sortBy") || "virality_score") as SortField;
    const minViews = parseInt(searchParams.get("minViews") || "0", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!brandId) {
      return NextResponse.json({ error: "brandId is required" }, { status: 400 });
    }

    if (!VALID_SORT_FIELDS.includes(sortBy)) {
      return NextResponse.json({ error: `Invalid sortBy. Must be one of: ${VALID_SORT_FIELDS.join(", ")}` }, { status: 400 });
    }

    const supabase = await createServiceClient();

    let query = supabase
      .from("raw_content")
      .select("*", { count: "exact" })
      .eq("brand_id", brandId);

    if (minViews > 0) {
      query = query.gte("views", minViews);
    }

    // Sort descending (most viral/viewed/liked first), except post_created_at where newest first is also desc
    query = query
      .order(sortBy, { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Viral feed query error:", error);
      return NextResponse.json({ error: "Failed to fetch viral content" }, { status: 500 });
    }

    return NextResponse.json({
      content: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Viral feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

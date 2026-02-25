import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("brands")
      .insert({
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
        industry: body.industry,
        keywords: body.keywords || [],
        primary_color: body.primary_color || "#14B8A6",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create brand" }, { status: 500 });
  }
}

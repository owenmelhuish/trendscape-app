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

    // Improved slug generation: handle special characters, accents, etc.
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // strip accents
        .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric
        .replace(/\s+/g, "-")           // spaces to hyphens
        .replace(/-+/g, "-")            // collapse multiple hyphens
        .replace(/^-|-$/g, "");         // trim leading/trailing hyphens

    // Insert brand
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .insert({
        name: body.name,
        slug,
        industry: body.industry,
        keywords: body.keywords || [],
        primary_color: body.primary_color || "#14B8A6",
        website_url: body.website_url || null,
      })
      .select()
      .single();

    if (brandError) throw brandError;

    // If userId provided, create brand_members row with owner role
    if (body.userId) {
      const { error: memberError } = await supabase
        .from("brand_members")
        .insert({
          brand_id: brand.id,
          user_id: body.userId,
          role: "owner",
        });

      if (memberError) {
        // Rollback: delete the brand we just created
        await supabase.from("brands").delete().eq("id", brand.id);
        throw new Error(`Brand created but failed to add member: ${memberError.message}`);
      }
    }

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}

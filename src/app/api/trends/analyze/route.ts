import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getClient, DEFAULT_MODEL, MAX_TOKENS } from "@/lib/ai/client";
import { parseAIResponse } from "@/lib/ai/parse-json";
import { TREND_ANALYSIS_PROMPT, BRAND_CONTEXTUALIZATION_PROMPT } from "@/lib/ai/prompts";

interface TrendAnalysis {
  why_trending: string;
  category: string;
  talking_points: string[];
  risk_notes: string | null;
}

interface BrandContextualization {
  how_to_use: string;
  relevance_score: number;
  content_angles: string[];
  talking_points: string[];
}

export async function POST(request: Request) {
  try {
    const { trendId, brandId } = await request.json();
    if (!trendId || !brandId) {
      return NextResponse.json(
        { error: "trendId and brandId are required" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const anthropic = getClient();

    // Fetch trend data
    const { data: trend, error: trendError } = await supabase
      .from("trends")
      .select("*")
      .eq("id", trendId)
      .single();

    if (trendError || !trend) {
      return NextResponse.json({ error: "Trend not found" }, { status: 404 });
    }

    // Fetch associated content
    const { data: contentLinks } = await supabase
      .from("trend_content")
      .select("raw_content (*)")
      .eq("trend_id", trendId)
      .limit(20);

    const contents = (contentLinks || []).map((l: any) => l.raw_content);

    // Fetch brand
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("*")
      .eq("id", brandId)
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (type: string, data: any) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`)
          );
        };

        try {
          // Step 1: Trend Analysis (WHY)
          emit("progress", { phase: "analyzing", message: "Analyzing trend patterns..." });

          const trendDataSummary = JSON.stringify({
            name: trend.name,
            type: trend.type,
            hashtag_cluster: trend.hashtag_cluster,
            music_name: trend.music_name,
            velocity_score: trend.velocity_score,
            breakout_score: trend.breakout_score,
            content_count: trend.content_count,
            total_views: trend.total_views,
            sample_content: contents.slice(0, 10).map((c: any) => ({
              caption: c.caption?.slice(0, 200),
              views: c.views,
              likes: c.likes,
              shares: c.shares,
              comments: c.comments,
              hashtags: c.hashtags,
              music_name: c.music_name,
              post_created_at: c.post_created_at,
            })),
          });

          const analysisResponse = await anthropic.messages.create({
            model: DEFAULT_MODEL,
            max_tokens: MAX_TOKENS,
            system: TREND_ANALYSIS_PROMPT,
            messages: [
              { role: "user", content: `Analyze this trend:\n\n${trendDataSummary}` },
            ],
          });

          const analysisText = analysisResponse.content[0].type === "text"
            ? analysisResponse.content[0].text
            : "";
          const analysis = parseAIResponse<TrendAnalysis>(analysisText);

          emit("progress", { phase: "contextualizing", message: "Generating brand strategy..." });

          // Step 2: Brand Contextualization (HOW)
          const brandContext = JSON.stringify({
            brand_name: brand.name,
            industry: brand.industry,
            keywords: brand.keywords,
            trend_analysis: analysis,
          });

          const contextResponse = await anthropic.messages.create({
            model: DEFAULT_MODEL,
            max_tokens: MAX_TOKENS,
            system: BRAND_CONTEXTUALIZATION_PROMPT,
            messages: [
              {
                role: "user",
                content: `Generate brand strategy for this trend:\n\n${brandContext}`,
              },
            ],
          });

          const contextText = contextResponse.content[0].type === "text"
            ? contextResponse.content[0].text
            : "";
          const contextualization = parseAIResponse<BrandContextualization>(contextText);

          // Update trend category if detected
          if (analysis.category) {
            await supabase
              .from("trends")
              .update({ category: analysis.category })
              .eq("id", trendId);
          }

          // Save report
          const { data: report, error: reportError } = await supabase
            .from("trend_reports")
            .insert({
              trend_id: trendId,
              brand_id: brandId,
              why_trending: analysis.why_trending,
              how_to_use: contextualization.how_to_use,
              relevance_score: contextualization.relevance_score,
              talking_points: [
                ...analysis.talking_points,
                ...contextualization.talking_points,
              ],
              content_angles: contextualization.content_angles,
              risk_notes: analysis.risk_notes,
              model_used: DEFAULT_MODEL,
            })
            .select()
            .single();

          if (reportError) {
            emit("error", { message: "Failed to save report" });
          } else {
            emit("complete", { report });
          }
        } catch (error) {
          emit("error", { message: String(error) });
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
    console.error("Trend analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

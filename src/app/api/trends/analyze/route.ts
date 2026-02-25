import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getClient, DEFAULT_MODEL, MAX_TOKENS } from "@/lib/ai/client";
import { parseAIResponse } from "@/lib/ai/parse-json";
import { TREND_ANALYSIS_PROMPT, BRAND_CONTEXTUALIZATION_PROMPT } from "@/lib/ai/prompts";
import { analyzeCaptionPatterns } from "@/lib/engine/caption-pattern-analyzer";
import type { RequiredSound } from "@/types/report";

interface TrendAnalysis {
  why_trending: string;
  category: string;
  what_makes_it_replicable: string;
  recreation_steps: string[];
  required_sound: RequiredSound;
  recommended_hooks: string[];
  caption_templates: string[];
  example_captions: string[];
  estimated_difficulty: string;
  talking_points: string[];
  risk_notes: string | null;
}

interface BrandContextualization {
  brand_adaptation: string;
  relevance_score: number;
  content_angles: string[];
  adapted_hooks: string[];
  adapted_captions: string[];
  hashtag_strategy: string[];
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

    // Pre-analyze caption patterns
    const captionAnalysis = analyzeCaptionPatterns({
      captions: contents.map((c: any) => c.caption || ""),
      music_name: trend.music_name,
      music_author: trend.music_author,
      hashtags: trend.hashtag_cluster || [],
    });

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
          // Step 1: Trend Analysis (content brief)
          emit("progress", { phase: "analyzing", message: "Analyzing trend format and patterns..." });

          const trendDataSummary = JSON.stringify({
            name: trend.name,
            type: trend.type,
            format_type: trend.format_type,
            format_label: trend.format_label,
            hashtag_cluster: trend.hashtag_cluster,
            music_name: trend.music_name,
            music_author: trend.music_author,
            velocity_score: trend.velocity_score,
            breakout_score: trend.breakout_score,
            content_count: trend.content_count,
            total_views: trend.total_views,
            caption_analysis: {
              detected_signals: captionAnalysis.detected_signals,
              common_hooks: captionAnalysis.common_hooks,
              caption_structures: captionAnalysis.caption_structures,
              is_original_sound: captionAnalysis.is_original_sound,
            },
            sample_content: contents.slice(0, 10).map((c: any) => ({
              caption: c.caption?.slice(0, 300),
              views: c.views,
              likes: c.likes,
              shares: c.shares,
              comments: c.comments,
              hashtags: c.hashtags,
              music_name: c.music_name,
              music_author: c.music_author,
              post_created_at: c.post_created_at,
            })),
          });

          const analysisResponse = await anthropic.messages.create({
            model: DEFAULT_MODEL,
            max_tokens: MAX_TOKENS,
            system: TREND_ANALYSIS_PROMPT,
            messages: [
              { role: "user", content: `Analyze this trend and produce a content brief:\n\n${trendDataSummary}` },
            ],
          });

          const analysisText = analysisResponse.content[0].type === "text"
            ? analysisResponse.content[0].text
            : "";
          const analysis = parseAIResponse<TrendAnalysis>(analysisText);

          emit("progress", { phase: "contextualizing", message: "Generating brand-specific adaptation..." });

          // Step 2: Brand Contextualization
          const brandContext = JSON.stringify({
            brand_name: brand.name,
            industry: brand.industry,
            keywords: brand.keywords,
            trend_brief: {
              name: trend.name,
              format_type: trend.format_type || analysis.category,
              format_label: trend.format_label,
              why_trending: analysis.why_trending,
              what_makes_it_replicable: analysis.what_makes_it_replicable,
              recreation_steps: analysis.recreation_steps,
              required_sound: analysis.required_sound,
              recommended_hooks: analysis.recommended_hooks,
              caption_templates: analysis.caption_templates,
              estimated_difficulty: analysis.estimated_difficulty,
            },
          });

          const contextResponse = await anthropic.messages.create({
            model: DEFAULT_MODEL,
            max_tokens: MAX_TOKENS,
            system: BRAND_CONTEXTUALIZATION_PROMPT,
            messages: [
              {
                role: "user",
                content: `Generate a brand-specific adaptation for this trend:\n\n${brandContext}`,
              },
            ],
          });

          const contextText = contextResponse.content[0].type === "text"
            ? contextResponse.content[0].text
            : "";
          const contextualization = parseAIResponse<BrandContextualization>(contextText);

          // Update trend with category and format info
          const trendUpdates: Record<string, unknown> = {};
          if (analysis.category) {
            trendUpdates.category = analysis.category;
          }
          if (typeof contextualization.relevance_score === "number") {
            trendUpdates.relevance_score = contextualization.relevance_score;
          }
          // Write format_type back to trends if not already set
          if (!trend.format_type && analysis.category) {
            trendUpdates.format_type = trend.format_type;
          }
          if (Object.keys(trendUpdates).length > 0) {
            await supabase
              .from("trends")
              .update(trendUpdates)
              .eq("id", trendId);
          }

          // Save report with all content brief fields
          const { data: report, error: reportError } = await supabase
            .from("trend_reports")
            .insert({
              trend_id: trendId,
              brand_id: brandId,
              why_trending: analysis.why_trending,
              how_to_use: contextualization.brand_adaptation,
              relevance_score: contextualization.relevance_score,
              talking_points: [
                ...analysis.talking_points,
                ...contextualization.talking_points,
              ],
              content_angles: contextualization.content_angles,
              risk_notes: analysis.risk_notes,
              model_used: DEFAULT_MODEL,
              // Content brief fields
              format_type: trend.format_type || null,
              format_label: trend.format_label || null,
              what_makes_it_replicable: analysis.what_makes_it_replicable,
              recreation_steps: analysis.recreation_steps || [],
              required_sound: analysis.required_sound || null,
              recommended_hooks: [
                ...(analysis.recommended_hooks || []),
                ...(contextualization.adapted_hooks || []),
              ],
              caption_templates: analysis.caption_templates || [],
              brand_adaptation: contextualization.brand_adaptation,
              example_captions: [
                ...(analysis.example_captions || []),
                ...(contextualization.adapted_captions || []),
              ],
              estimated_difficulty: analysis.estimated_difficulty || null,
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

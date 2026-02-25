/**
 * Batch AI format classification for trend clusters.
 * One Claude call per detection run that classifies ALL clusters at once.
 */

import { getClient, DEFAULT_MODEL } from "@/lib/ai/client";
import { parseAIResponse } from "@/lib/ai/parse-json";
import { analyzeCaptionPatterns, type CaptionAnalysis } from "./caption-pattern-analyzer";
import type { FormatType } from "@/types/trend";

export interface ClusterInput {
  cluster_id: string;
  name: string;
  hashtags: string[];
  music_name: string | null;
  music_author: string | null;
  sample_captions: string[];
}

export interface FormatClassification {
  cluster_id: string;
  format_type: FormatType;
  format_label: string;
  caption_analysis: CaptionAnalysis;
}

const FORMAT_CLASSIFICATION_PROMPT = `You are a TikTok format analyst. For each content cluster below, determine the specific REPLICABLE FORMAT — not just the topic.

A "format" is a repeatable content structure: a specific sound usage pattern, a meme template, a POV style, a challenge mechanic, a tutorial framework, etc. The format_label should be specific enough that a content creator knows exactly what kind of video to make.

For each cluster, return:
- format_type: one of: sound_trend, meme_template, challenge, tutorial_format, pov_format, grwm, transition_trend, storytime, before_after, other
- format_label: a specific descriptive label (e.g., "POV Reaction with Trending Audio", "Before/After Transformation with [sound name]", "Step-by-Step Tutorial with Voiceover", NOT just "POV" or "Tutorial")

Respond with ONLY valid JSON, no markdown. Return an array matching the input order:
[
  { "cluster_id": "...", "format_type": "...", "format_label": "..." },
  ...
]

RULES:
- format_type must be one of the allowed values listed above
- format_label should be 4-10 words, specific to the content pattern
- If a cluster uses a specific trending sound, mention it in format_label
- If unsure, use "other" with a descriptive format_label
- Return ONLY valid JSON, no markdown fences.`;

export async function classifyFormats(
  clusters: ClusterInput[]
): Promise<FormatClassification[]> {
  if (clusters.length === 0) return [];

  // Pre-analyze all clusters with heuristics
  const analyses = clusters.map((cluster) =>
    analyzeCaptionPatterns({
      captions: cluster.sample_captions,
      music_name: cluster.music_name,
      music_author: cluster.music_author,
      hashtags: cluster.hashtags,
    })
  );

  // Build input for Claude
  const clusterSummaries = clusters.map((cluster, i) => ({
    cluster_id: cluster.cluster_id,
    name: cluster.name,
    hashtags: cluster.hashtags.slice(0, 10),
    music_name: cluster.music_name,
    music_author: cluster.music_author,
    is_original_sound: analyses[i].is_original_sound,
    detected_caption_signals: analyses[i].detected_signals,
    caption_structures: analyses[i].caption_structures,
    sample_captions: cluster.sample_captions.slice(0, 5),
  }));

  try {
    const anthropic = getClient();

    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2048,
      system: FORMAT_CLASSIFICATION_PROMPT,
      messages: [
        {
          role: "user",
          content: `Classify these ${clusters.length} clusters:\n\n${JSON.stringify(clusterSummaries, null, 2)}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const results = parseAIResponse<
      Array<{ cluster_id: string; format_type: FormatType; format_label: string }>
    >(text);

    // Merge AI results with heuristic analyses
    return results.map((result, i) => ({
      cluster_id: result.cluster_id,
      format_type: result.format_type,
      format_label: result.format_label,
      caption_analysis: analyses[i] || analyses[0],
    }));
  } catch (error) {
    console.error("Format classification failed:", error);

    // Fallback: use heuristic-only classification
    return clusters.map((cluster, i) => ({
      cluster_id: cluster.cluster_id,
      format_type: analyses[i].primary_signal || "other",
      format_label: analyses[i].primary_signal
        ? `${analyses[i].primary_signal} pattern`
        : cluster.name,
      caption_analysis: analyses[i],
    }));
  }
}

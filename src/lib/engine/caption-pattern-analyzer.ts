/**
 * Heuristic pre-processing module for caption format signals.
 * No AI call — scans captions for structural patterns, opening hooks,
 * and format-indicating keywords before the AI classification step.
 */

import { CAPTION_FORMAT_SIGNALS } from "@/lib/constants";
import type { FormatType } from "@/types/trend";

export interface CaptionAnalysis {
  primary_signal: FormatType | null;
  detected_signals: Record<string, number>; // format_type → count
  common_hooks: string[];
  caption_structures: string[];
  is_original_sound: boolean;
}

interface AnalysisInput {
  captions: string[];
  music_name: string | null;
  music_author: string | null;
  hashtags: string[];
}

export function analyzeCaptionPatterns(input: AnalysisInput): CaptionAnalysis {
  const { captions, music_name, music_author, hashtags } = input;

  // 1. Scan captions for format signals
  const signalCounts: Record<string, number> = {};
  const lowerCaptions = captions.map((c) => c.toLowerCase());

  for (const [formatType, keywords] of Object.entries(CAPTION_FORMAT_SIGNALS)) {
    let count = 0;
    for (const caption of lowerCaptions) {
      if (keywords.some((kw) => caption.includes(kw))) {
        count++;
      }
    }
    if (count > 0) {
      signalCounts[formatType] = count;
    }
  }

  // Also check hashtags for format signals
  const hashtagStr = hashtags.join(" ").toLowerCase();
  const formatHashtags: Record<string, string[]> = {
    pov_format: ["pov"],
    tutorial_format: ["tutorial", "howto", "learnontiktok"],
    grwm: ["grwm", "getreadywithme"],
    storytime: ["storytime"],
    challenge: ["challenge"],
    before_after: ["beforeandafter", "glowup", "transformation"],
    transition_trend: ["transition"],
  };

  for (const [formatType, tags] of Object.entries(formatHashtags)) {
    if (tags.some((t) => hashtagStr.includes(t))) {
      signalCounts[formatType] = (signalCounts[formatType] || 0) + 2; // weight hashtag matches
    }
  }

  // 2. Determine primary signal (highest count, minimum 2 occurrences)
  let primary_signal: FormatType | null = null;
  let maxCount = 1; // require at least 2 to be a signal
  for (const [type, count] of Object.entries(signalCounts)) {
    if (count > maxCount) {
      maxCount = count;
      primary_signal = type as FormatType;
    }
  }

  // 3. Extract common opening hooks (first ~12 words)
  const hooks: string[] = [];
  for (const caption of captions) {
    const trimmed = caption.trim();
    if (!trimmed) continue;
    const words = trimmed.split(/\s+/).slice(0, 12);
    const hook = words.join(" ");
    if (hook.length > 10) {
      hooks.push(hook);
    }
  }
  // Deduplicate similar hooks (same first 5 words)
  const seenPrefixes = new Set<string>();
  const common_hooks = hooks.filter((h) => {
    const prefix = h.split(/\s+/).slice(0, 5).join(" ").toLowerCase();
    if (seenPrefixes.has(prefix)) return false;
    seenPrefixes.add(prefix);
    return true;
  }).slice(0, 8);

  // 4. Identify structural patterns
  const structures: string[] = [];
  const povCount = lowerCaptions.filter((c) => c.startsWith("pov")).length;
  if (povCount >= 2) structures.push("POV: [scenario]");

  const questionCount = lowerCaptions.filter((c) => c.includes("?")).length;
  if (questionCount >= Math.ceil(captions.length / 2)) structures.push("[Question]? [Response]");

  const whenCount = lowerCaptions.filter(
    (c) => c.startsWith("when ") || c.startsWith("when your") || c.startsWith("me when")
  ).length;
  if (whenCount >= 2) structures.push("[Setup] when [Situation]");

  const waitCount = lowerCaptions.filter(
    (c) => c.includes("wait for it") || c.includes("watch this") || c.includes("wait til")
  ).length;
  if (waitCount >= 2) structures.push("[Setup] + [Reveal]");

  const stepCount = lowerCaptions.filter(
    (c) => c.includes("step 1") || c.includes("step one") || /^\d+[\.\)]/.test(c)
  ).length;
  if (stepCount >= 2) structures.push("[Step 1] [Step 2] [Step 3]");

  // 5. Check if music is original sound
  const is_original_sound = isOriginalSound(music_name, music_author);

  return {
    primary_signal,
    detected_signals: signalCounts,
    common_hooks,
    caption_structures: structures,
    is_original_sound,
  };
}

function isOriginalSound(
  music_name: string | null,
  music_author: string | null
): boolean {
  if (!music_name) return true;
  const lower = music_name.toLowerCase();
  return (
    lower.includes("original sound") ||
    lower.includes("original audio") ||
    lower.startsWith("son original") ||
    lower === ""
  );
}

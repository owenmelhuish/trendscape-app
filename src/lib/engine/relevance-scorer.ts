import { INDUSTRY_TERMS } from "@/lib/constants";

interface BrandContext {
  industry: string;
  keywords: string[];
}

interface ClusterData {
  hashtags: string[];
  captions: string[];
}

/**
 * Calculate keyword relevance score (0–100) for a trend cluster
 * relative to a brand's industry and keywords.
 *
 * Scoring:
 * - Direct hashtag-keyword overlap: 0–50 pts
 * - Caption keyword mentions:       0–25 pts
 * - Industry alignment:             0–25 pts
 */
export function calculateKeywordRelevance(
  brand: BrandContext,
  cluster: ClusterData
): number {
  const brandKeywords = brand.keywords.map((k) => k.toLowerCase());
  const clusterHashtags = cluster.hashtags.map((h) => h.toLowerCase());

  // 1. Direct hashtag-keyword overlap (0-50 pts)
  let hashtagScore = 0;
  if (brandKeywords.length > 0 && clusterHashtags.length > 0) {
    let matchCount = 0;
    for (const keyword of brandKeywords) {
      const keywordTokens = keyword.split(/\s+/);
      for (const tag of clusterHashtags) {
        // Exact match or substring match
        if (tag === keyword || tag.includes(keyword) || keyword.includes(tag)) {
          matchCount++;
          break;
        }
        // Multi-word keyword: check if any token matches
        if (keywordTokens.length > 1 && keywordTokens.some((t) => tag.includes(t))) {
          matchCount += 0.5;
          break;
        }
      }
    }
    const overlapRatio = matchCount / brandKeywords.length;
    hashtagScore = Math.min(50, overlapRatio * 50);
  }

  // 2. Caption keyword mentions (0-25 pts)
  let captionScore = 0;
  if (brandKeywords.length > 0 && cluster.captions.length > 0) {
    const allCaptionText = cluster.captions.join(" ").toLowerCase();
    let mentionCount = 0;
    for (const keyword of brandKeywords) {
      if (allCaptionText.includes(keyword)) {
        mentionCount++;
      }
    }
    const mentionRatio = mentionCount / brandKeywords.length;
    captionScore = Math.min(25, mentionRatio * 25);
  }

  // 3. Industry alignment (0-25 pts)
  let industryScore = 0;
  const industryTerms = INDUSTRY_TERMS[brand.industry] || [];
  if (industryTerms.length > 0) {
    const allText = [...clusterHashtags, ...cluster.captions.map((c) => c.toLowerCase())].join(" ");
    let termMatches = 0;
    for (const term of industryTerms) {
      if (allText.includes(term)) {
        termMatches++;
      }
    }
    const termRatio = termMatches / industryTerms.length;
    industryScore = Math.min(25, termRatio * 50); // Scale so hitting half the terms = full score
  }

  return Math.round(Math.min(100, hashtagScore + captionScore + industryScore));
}

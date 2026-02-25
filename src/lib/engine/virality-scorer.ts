import type { RawContent } from "@/types/content";

interface ScoredContent {
  id: string;
  virality_score: number;
  engagement_rate: number;
}

/**
 * Calculate engagement rate for a piece of content.
 */
function calcEngagementRate(item: RawContent): number {
  if (!item.views || item.views === 0) return 0;
  return (item.likes + item.comments + item.shares) / item.views;
}

/**
 * Log-scaled view score (0-1). Uses log10 so:
 * 1K views ≈ 0.3, 10K ≈ 0.4, 100K ≈ 0.5, 1M ≈ 0.6, 10M ≈ 0.7, 100M ≈ 0.8
 * Capped at 1B views = 1.0
 */
function viewScore(views: number): number {
  if (views <= 0) return 0;
  const maxLog = Math.log10(1_000_000_000); // 9
  return Math.min(Math.log10(views) / maxLog, 1);
}

/**
 * Engagement rate score (0-1). Most viral TikToks hit 5-15% engagement.
 * Cap at 25% to avoid micro-accounts with inflated rates.
 */
function engagementScore(rate: number): number {
  return Math.min(rate / 0.25, 1);
}

/**
 * Share score (0-1). Log-scaled, shares are the strongest organic signal.
 * 100 shares ≈ 0.4, 1K ≈ 0.6, 10K ≈ 0.8, 100K ≈ 1.0
 */
function shareScore(shares: number): number {
  if (shares <= 0) return 0;
  const maxLog = Math.log10(100_000); // 5
  return Math.min(Math.log10(shares) / maxLog, 1);
}

/**
 * Recency score (0-1). Content from today = 1.0, decays over 14 days.
 */
function recencyScore(postCreatedAt: string): number {
  const ageMs = Date.now() - new Date(postCreatedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  if (ageDays <= 0) return 1;
  if (ageDays >= 14) return 0;
  return 1 - ageDays / 14;
}

/**
 * Calculate virality score (0-100) for a single content item.
 * Weights: views 40%, engagement 30%, shares 20%, recency 10%
 */
export function scoreItem(item: RawContent): ScoredContent {
  const er = calcEngagementRate(item);
  const raw =
    viewScore(item.views) * 0.4 +
    engagementScore(er) * 0.3 +
    shareScore(item.shares) * 0.2 +
    recencyScore(item.post_created_at) * 0.1;

  return {
    id: item.id,
    virality_score: Math.round(raw * 100),
    engagement_rate: Math.round(er * 10000) / 10000, // 4 decimal places
  };
}

/**
 * Score a batch of content items.
 */
export function scoreContent(items: RawContent[]): ScoredContent[] {
  return items.map(scoreItem);
}

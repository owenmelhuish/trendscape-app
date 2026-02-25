/**
 * Velocity and Breakout score calculations.
 */

interface ContentMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  post_created_at: string;
  author_username: string;
}

function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

function weightedEngagement(c: ContentMetrics): number {
  return c.likes + c.shares * 2 + c.comments * 3;
}

export function calculateVelocityScore(contents: ContentMetrics[]): number {
  if (contents.length === 0) return 0;

  const now = Date.now();
  const h24 = 24 * 60 * 60 * 1000;
  const h48 = 48 * 60 * 60 * 1000;

  let engagementLast24h = 0;
  let engagement24to48h = 0;
  let postsLast24h = 0;
  let totalViews = 0;

  for (const c of contents) {
    const age = now - new Date(c.post_created_at).getTime();
    const engagement = weightedEngagement(c);
    totalViews += c.views;

    if (age <= h24) {
      engagementLast24h += engagement;
      postsLast24h++;
    } else if (age <= h48) {
      engagement24to48h += engagement;
    }
  }

  const growthRatio = engagement24to48h > 0
    ? (engagementLast24h / engagement24to48h - 1) * 50
    : engagementLast24h > 0 ? 50 : 0;

  const newPostRatio = contents.length > 0
    ? (postsLast24h / contents.length) * 30
    : 0;

  const viewBonus = totalViews > 0 ? Math.log10(totalViews) * 2 : 0;

  return clamp(0, 100, growthRatio + newPostRatio + viewBonus);
}

export function calculateBreakoutScore(
  contents: ContentMetrics[],
  velocityScore: number,
  industryAvgEngRate: number = 0.05
): number {
  if (contents.length === 0) return 0;

  // Average engagement rate
  const avgEngRate = contents.reduce((sum, c) => {
    const eng = weightedEngagement(c);
    return sum + (c.views > 0 ? eng / c.views : 0);
  }, 0) / contents.length;

  const engRateComponent = industryAvgEngRate > 0
    ? (avgEngRate / industryAvgEngRate) * 25
    : 0;

  // Creator diversity: unique creators / total posts
  const uniqueCreators = new Set(contents.map((c) => c.author_username)).size;
  const creatorDiversity = (uniqueCreators / contents.length) * 20;

  // Recency bonus: how recently did this trend start?
  const firstSeen = Math.min(
    ...contents.map((c) => new Date(c.post_created_at).getTime())
  );
  const hoursSinceFirst = (Date.now() - firstSeen) / (1000 * 60 * 60);
  const recencyBonus = Math.max(0, 1 - hoursSinceFirst / 48) * 20;

  return clamp(
    0,
    100,
    velocityScore * 0.35 + engRateComponent + creatorDiversity + recencyBonus
  );
}

export function determineStatus(
  breakoutScore: number,
  velocityScore: number,
  previousStatus?: string
): string {
  // Score-based lifecycle
  if (breakoutScore >= 75 && velocityScore >= 60) return "peaking";
  if (breakoutScore >= 50 && velocityScore >= 40) return "active";
  if (breakoutScore >= 25 && velocityScore >= 20) return "emerging";

  // Decline detection
  if (previousStatus === "peaking" || previousStatus === "active") {
    return "declining";
  }

  if (breakoutScore < 15 && velocityScore < 10) return "expired";

  return previousStatus || "emerging";
}

export function calculateAggregates(contents: ContentMetrics[]) {
  const totalViews = contents.reduce((s, c) => s + c.views, 0);
  const totalLikes = contents.reduce((s, c) => s + c.likes, 0);
  const avgEngRate = contents.length > 0
    ? contents.reduce((s, c) => {
        const eng = weightedEngagement(c);
        return s + (c.views > 0 ? eng / c.views : 0);
      }, 0) / contents.length
    : 0;

  return {
    content_count: contents.length,
    total_views: totalViews,
    total_likes: totalLikes,
    avg_engagement_rate: Math.round(avgEngRate * 10000) / 10000,
  };
}

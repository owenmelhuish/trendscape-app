import { clusterByHashtags } from "./hashtag-clusterer";
import { groupByMusic } from "./music-grouper";
import {
  calculateVelocityScore,
  calculateBreakoutScore,
  determineStatus,
  calculateAggregates,
} from "./score-calculator";
import type { SupabaseClient } from "@supabase/supabase-js";

interface DetectionResult {
  trendsCreated: number;
  trendsUpdated: number;
  autoAnalyzeIds: string[];
}

export async function detectTrends(
  supabase: SupabaseClient,
  brandId: string,
  onProgress?: (message: string) => void
): Promise<DetectionResult> {
  const emit = onProgress || (() => {});

  emit("Fetching recent content...");

  // Get content from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: content, error } = await supabase
    .from("raw_content")
    .select("*")
    .eq("brand_id", brandId)
    .gte("post_created_at", sevenDaysAgo)
    .order("post_created_at", { ascending: false });

  if (error) throw error;
  if (!content?.length) {
    emit("No recent content found.");
    return { trendsCreated: 0, trendsUpdated: 0, autoAnalyzeIds: [] };
  }

  emit(`Found ${content.length} posts. Clustering hashtags...`);

  // 1. Cluster by hashtags
  const hashtagClusters = clusterByHashtags(
    content.map((c) => ({ id: c.id, hashtags: c.hashtags || [] }))
  );

  emit(`Found ${hashtagClusters.length} hashtag clusters. Grouping music...`);

  // 2. Group by music
  const musicGroups = groupByMusic(
    content.map((c) => ({
      id: c.id,
      music_id: c.music_id,
      music_name: c.music_name,
    }))
  );

  emit(`Found ${musicGroups.length} music groups. Scoring trends...`);

  let trendsCreated = 0;
  let trendsUpdated = 0;
  const autoAnalyzeIds: string[] = [];

  // 3. Upsert hashtag cluster trends
  for (const cluster of hashtagClusters) {
    const clusterContent = content.filter((c) => cluster.contentIds.includes(c.id));
    const velocity = calculateVelocityScore(clusterContent);
    const breakout = calculateBreakoutScore(clusterContent, velocity);
    const aggregates = calculateAggregates(clusterContent);

    // Check if trend with similar hashtags already exists
    const { data: existing } = await supabase
      .from("trends")
      .select("id, status")
      .eq("brand_id", brandId)
      .eq("type", "hashtag_cluster")
      .contains("hashtag_cluster", cluster.hashtags.slice(0, 3))
      .limit(1);

    const status = determineStatus(breakout, velocity, existing?.[0]?.status);

    const trendData = {
      brand_id: brandId,
      name: cluster.name,
      type: "hashtag_cluster" as const,
      hashtag_cluster: cluster.hashtags,
      velocity_score: velocity,
      breakout_score: breakout,
      status,
      ...aggregates,
    };

    let trendId: string;

    if (existing?.[0]) {
      const { error: updateError } = await supabase
        .from("trends")
        .update({ ...trendData, updated_at: new Date().toISOString() })
        .eq("id", existing[0].id);
      if (!updateError) trendsUpdated++;
      trendId = existing[0].id;
    } else {
      const { data: newTrend, error: insertError } = await supabase
        .from("trends")
        .insert(trendData)
        .select("id")
        .single();
      if (!insertError && newTrend) {
        trendsCreated++;
        trendId = newTrend.id;
      } else continue;
    }

    // Link content to trend
    const links = cluster.contentIds.map((contentId) => ({
      trend_id: trendId,
      content_id: contentId,
      relevance: 1.0,
    }));

    await supabase
      .from("trend_content")
      .upsert(links, { onConflict: "trend_id,content_id" });

    // Queue for auto-analysis if breakout >= 40
    if (breakout >= 40) {
      autoAnalyzeIds.push(trendId);
    }
  }

  // 4. Upsert music trends
  for (const group of musicGroups) {
    const groupContent = content.filter((c) => group.contentIds.includes(c.id));
    const velocity = calculateVelocityScore(groupContent);
    const breakout = calculateBreakoutScore(groupContent, velocity);
    const aggregates = calculateAggregates(groupContent);

    const { data: existing } = await supabase
      .from("trends")
      .select("id, status")
      .eq("brand_id", brandId)
      .eq("type", "music")
      .eq("music_id", group.musicId)
      .limit(1);

    const status = determineStatus(breakout, velocity, existing?.[0]?.status);

    const trendData = {
      brand_id: brandId,
      name: group.musicName,
      type: "music" as const,
      music_id: group.musicId,
      music_name: group.musicName,
      velocity_score: velocity,
      breakout_score: breakout,
      status,
      ...aggregates,
    };

    let trendId: string;

    if (existing?.[0]) {
      await supabase
        .from("trends")
        .update({ ...trendData, updated_at: new Date().toISOString() })
        .eq("id", existing[0].id);
      trendsUpdated++;
      trendId = existing[0].id;
    } else {
      const { data: newTrend, error: insertError } = await supabase
        .from("trends")
        .insert(trendData)
        .select("id")
        .single();
      if (!insertError && newTrend) {
        trendsCreated++;
        trendId = newTrend.id;
      } else continue;
    }

    const links = group.contentIds.map((contentId) => ({
      trend_id: trendId,
      content_id: contentId,
      relevance: 1.0,
    }));

    await supabase
      .from("trend_content")
      .upsert(links, { onConflict: "trend_id,content_id" });

    if (breakout >= 40) {
      autoAnalyzeIds.push(trendId);
    }
  }

  emit(`Done. Created ${trendsCreated}, updated ${trendsUpdated}, ${autoAnalyzeIds.length} queued for analysis.`);

  return { trendsCreated, trendsUpdated, autoAnalyzeIds };
}

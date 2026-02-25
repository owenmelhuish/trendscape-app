import { clusterByHashtags } from "./hashtag-clusterer";
import { groupByMusic } from "./music-grouper";
import { calculateKeywordRelevance } from "./relevance-scorer";
import {
  calculateVelocityScore,
  calculateBreakoutScore,
  determineStatus,
  calculateAggregates,
} from "./score-calculator";
import { classifyFormats, type ClusterInput } from "./format-classifier";
import { RELEVANCE_THRESHOLDS } from "@/lib/constants";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormatType } from "@/types/trend";

interface DetectionResult {
  trendsCreated: number;
  trendsUpdated: number;
  autoAnalyzeIds: string[];
}

interface ClusterTrendRecord {
  clusterId: string;
  trendId: string;
}

export async function detectTrends(
  supabase: SupabaseClient,
  brandId: string,
  onProgress?: (message: string) => void
): Promise<DetectionResult> {
  const emit = onProgress || (() => {});

  emit("Fetching brand context...");

  // Fetch brand context for relevance scoring
  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("industry, keywords")
    .eq("id", brandId)
    .single();

  if (brandError || !brand) {
    throw new Error("Brand not found");
  }

  const brandContext = {
    industry: brand.industry || "",
    keywords: brand.keywords || [],
  };

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
      music_author: c.music_author || null,
    }))
  );

  emit(`Found ${musicGroups.length} music groups. Classifying formats...`);

  // 3. Build cluster inputs for format classification
  const allClusterInputs: ClusterInput[] = [];

  for (let i = 0; i < hashtagClusters.length; i++) {
    const cluster = hashtagClusters[i];
    const clusterContent = content.filter((c) => cluster.contentIds.includes(c.id));
    allClusterInputs.push({
      cluster_id: `hashtag_${i}`,
      name: cluster.name,
      hashtags: cluster.hashtags,
      music_name: clusterContent[0]?.music_name || null,
      music_author: clusterContent[0]?.music_author || null,
      sample_captions: clusterContent.slice(0, 5).map((c) => c.caption || ""),
    });
  }

  for (let i = 0; i < musicGroups.length; i++) {
    const group = musicGroups[i];
    const groupContent = content.filter((c) => group.contentIds.includes(c.id));
    allClusterInputs.push({
      cluster_id: `music_${i}`,
      name: group.musicName,
      hashtags: groupContent.flatMap((c) => c.hashtags || []),
      music_name: group.musicName,
      music_author: group.musicAuthor,
      sample_captions: groupContent.slice(0, 5).map((c) => c.caption || ""),
    });
  }

  // 4. Batch format classification (non-fatal)
  let formatMap = new Map<string, { format_type: FormatType; format_label: string }>();
  try {
    if (allClusterInputs.length > 0) {
      const classifications = await classifyFormats(allClusterInputs);
      for (const c of classifications) {
        formatMap.set(c.cluster_id, {
          format_type: c.format_type,
          format_label: c.format_label,
        });
      }
    }
  } catch (err) {
    console.error("Format classification failed (non-fatal):", err);
  }

  emit("Scoring and upserting trends...");

  let trendsCreated = 0;
  let trendsUpdated = 0;
  const autoAnalyzeIds: string[] = [];

  // 5. Upsert hashtag cluster trends
  for (let i = 0; i < hashtagClusters.length; i++) {
    const cluster = hashtagClusters[i];
    const clusterContent = content.filter((c) => cluster.contentIds.includes(c.id));
    const velocity = calculateVelocityScore(clusterContent);
    const breakout = calculateBreakoutScore(clusterContent, velocity);
    const aggregates = calculateAggregates(clusterContent);

    const relevance = calculateKeywordRelevance(brandContext, {
      hashtags: cluster.hashtags,
      captions: clusterContent.map((c) => c.caption || ""),
    });

    const { data: existing } = await supabase
      .from("trends")
      .select("id, status")
      .eq("brand_id", brandId)
      .eq("type", "hashtag_cluster")
      .contains("hashtag_cluster", cluster.hashtags.slice(0, 3))
      .limit(1);

    const status = determineStatus(breakout, velocity, existing?.[0]?.status);

    const format = formatMap.get(`hashtag_${i}`);
    const trendData = {
      brand_id: brandId,
      name: cluster.name,
      type: "hashtag_cluster" as const,
      hashtag_cluster: cluster.hashtags,
      velocity_score: velocity,
      breakout_score: breakout,
      relevance_score: relevance,
      status,
      format_type: format?.format_type || null,
      format_label: format?.format_label || null,
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

    const links = cluster.contentIds.map((contentId) => ({
      trend_id: trendId,
      content_id: contentId,
      relevance: 1.0,
    }));

    await supabase
      .from("trend_content")
      .upsert(links, { onConflict: "trend_id,content_id" });

    if ((breakout >= 40 && relevance >= RELEVANCE_THRESHOLDS.auto_analyze) || relevance >= RELEVANCE_THRESHOLDS.high) {
      autoAnalyzeIds.push(trendId);
    }
  }

  // 6. Upsert music trends
  for (let i = 0; i < musicGroups.length; i++) {
    const group = musicGroups[i];
    const groupContent = content.filter((c) => group.contentIds.includes(c.id));
    const velocity = calculateVelocityScore(groupContent);
    const breakout = calculateBreakoutScore(groupContent, velocity);
    const aggregates = calculateAggregates(groupContent);

    const relevance = calculateKeywordRelevance(brandContext, {
      hashtags: groupContent.flatMap((c) => c.hashtags || []),
      captions: [
        group.musicName,
        ...groupContent.map((c) => c.caption || ""),
      ],
    });

    const { data: existing } = await supabase
      .from("trends")
      .select("id, status")
      .eq("brand_id", brandId)
      .eq("type", "music")
      .eq("music_id", group.musicId)
      .limit(1);

    const status = determineStatus(breakout, velocity, existing?.[0]?.status);

    const format = formatMap.get(`music_${i}`);
    const trendData = {
      brand_id: brandId,
      name: group.musicName,
      type: "music" as const,
      music_id: group.musicId,
      music_name: group.musicName,
      music_author: group.musicAuthor,
      velocity_score: velocity,
      breakout_score: breakout,
      relevance_score: relevance,
      status,
      format_type: format?.format_type || null,
      format_label: format?.format_label || null,
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

    if ((breakout >= 40 && relevance >= RELEVANCE_THRESHOLDS.auto_analyze) || relevance >= RELEVANCE_THRESHOLDS.high) {
      autoAnalyzeIds.push(trendId);
    }
  }

  emit(`Done. Created ${trendsCreated}, updated ${trendsUpdated}, ${autoAnalyzeIds.length} queued for analysis.`);

  return { trendsCreated, trendsUpdated, autoAnalyzeIds };
}

import { getApifyClient } from "./apify-client";

const TIKTOK_ACTOR_ID = "clockworks/free-tiktok-scraper";

export interface TikTokActorInput {
  searchQueries: string[];
  resultsPerPage: number;
  shouldDownloadVideos: boolean;
  shouldDownloadCovers: boolean;
}

export interface TikTokActorResult {
  id: string;
  text: string;
  createTime: number;
  authorMeta: {
    id: string;
    name: string;
    nickName: string;
  };
  musicMeta: {
    musicId: string;
    musicName: string;
    musicAuthor: string;
  };
  covers: string[];
  videoUrl: string;
  diggCount: number;
  shareCount: number;
  playCount: number;
  commentCount: number;
  hashtags: Array<{ id: string; name: string }>;
}

export function buildActorInput(keywords: string[]): TikTokActorInput {
  return {
    searchQueries: keywords,
    resultsPerPage: 30,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
  };
}

export async function startTikTokScrape(
  keywords: string[],
  webhookUrl?: string
): Promise<{ runId: string }> {
  const client = getApifyClient();
  const input = buildActorInput(keywords);

  const options: Record<string, unknown> = {};
  if (webhookUrl) {
    options.webhooks = [
      {
        eventTypes: ["ACTOR.RUN.SUCCEEDED", "ACTOR.RUN.FAILED"],
        requestUrl: webhookUrl,
      },
    ];
  }

  const run = await client.actor(TIKTOK_ACTOR_ID).start(input, options);

  return { runId: run.id };
}

export async function waitForRun(
  runId: string,
  waitSecs: number = 55
): Promise<{ status: string; exitCode?: number }> {
  const client = getApifyClient();
  const result = await client.run(runId).waitForFinish({ waitSecs });
  return { status: result?.status ?? "UNKNOWN", exitCode: result?.exitCode };
}

export async function fetchRunResults(runId: string): Promise<TikTokActorResult[]> {
  const client = getApifyClient();
  const { items } = await client.run(runId).dataset().listItems();
  return items as unknown as TikTokActorResult[];
}

export function mapTikTokResult(
  result: TikTokActorResult,
  brandId: string,
  scrapeJobId: string
) {
  return {
    brand_id: brandId,
    scrape_job_id: scrapeJobId,
    platform: "tiktok" as const,
    post_id: result.id,
    author_username: result.authorMeta?.name || "unknown",
    author_name: result.authorMeta?.nickName || "",
    caption: result.text || "",
    hashtags: (result.hashtags || []).map((h) => h.name.toLowerCase()),
    music_id: result.musicMeta?.musicId || null,
    music_name: result.musicMeta?.musicName || null,
    music_author: result.musicMeta?.musicAuthor || null,
    views: result.playCount || 0,
    likes: result.diggCount || 0,
    shares: result.shareCount || 0,
    comments: result.commentCount || 0,
    thumbnail_url: result.covers?.[0] || null,
    video_url: result.videoUrl || null,
    post_created_at: result.createTime
      ? new Date(result.createTime * 1000).toISOString()
      : new Date().toISOString(),
  };
}

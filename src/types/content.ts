export type Platform = 'tiktok';

export interface RawContent {
  id: string;
  brand_id: string;
  scrape_job_id: string;
  platform: Platform;
  post_id: string;
  author_username: string;
  author_name: string;
  caption: string;
  hashtags: string[];
  music_id: string | null;
  music_name: string | null;
  music_author: string | null;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  thumbnail_url: string | null;
  video_url: string | null;
  virality_score: number | null;
  engagement_rate: number | null;
  post_created_at: string;
  scraped_at: string;
}

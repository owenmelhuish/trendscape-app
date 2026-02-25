export type TrendType = 'hashtag_cluster' | 'music' | 'meme_format' | 'cultural_moment' | 'caption_pattern';
export type TrendStatus = 'emerging' | 'active' | 'peaking' | 'declining' | 'expired';

export type FormatType =
  | 'sound_trend'
  | 'meme_template'
  | 'challenge'
  | 'tutorial_format'
  | 'pov_format'
  | 'grwm'
  | 'transition_trend'
  | 'storytime'
  | 'before_after'
  | 'other';

export interface Trend {
  id: string;
  brand_id: string;
  name: string;
  type: TrendType;
  hashtag_cluster: string[];
  music_id: string | null;
  music_name: string | null;
  music_author: string | null;
  format_type: FormatType | null;
  format_label: string | null;
  velocity_score: number;
  breakout_score: number;
  relevance_score: number;
  category: string | null;
  content_count: number;
  total_views: number;
  total_likes: number;
  avg_engagement_rate: number;
  first_seen: string;
  peak_time: string | null;
  status: TrendStatus;
  created_at: string;
  updated_at: string;
}

export interface TrendContent {
  id: string;
  trend_id: string;
  content_id: string;
  relevance: number;
}

export interface TrendWithContent extends Trend {
  contents: Array<import('./content').RawContent & { relevance: number }>;
}

export interface RequiredSound {
  music_name: string | null;
  music_author: string | null;
  is_original_sound: boolean;
  usage_note: string;
}

export interface TrendReport {
  id: string;
  trend_id: string;
  brand_id: string;
  why_trending: string;
  how_to_use: string;
  relevance_score: number;
  talking_points: string[];
  content_angles: string[];
  risk_notes: string | null;
  generated_at: string;
  model_used: string;
  // Content brief fields
  format_type: string | null;
  format_label: string | null;
  what_makes_it_replicable: string | null;
  recreation_steps: string[];
  required_sound: RequiredSound | null;
  recommended_hooks: string[];
  caption_templates: string[];
  brand_adaptation: string | null;
  example_captions: string[];
  estimated_difficulty: string | null;
}

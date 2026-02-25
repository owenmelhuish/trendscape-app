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
}

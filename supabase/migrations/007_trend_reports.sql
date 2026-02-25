-- Create trend_reports table (AI-generated analysis)
CREATE TABLE trend_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  why_trending TEXT NOT NULL,
  how_to_use TEXT NOT NULL,
  relevance_score NUMERIC(5,2) DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 100),
  talking_points TEXT[] DEFAULT '{}',
  content_angles TEXT[] DEFAULT '{}',
  risk_notes TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  model_used TEXT NOT NULL
);

CREATE INDEX idx_trend_reports_trend ON trend_reports(trend_id);
CREATE INDEX idx_trend_reports_brand ON trend_reports(brand_id);

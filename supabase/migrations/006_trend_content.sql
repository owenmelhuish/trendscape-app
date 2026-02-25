-- Create trend_content junction table (links trends to raw_content)
CREATE TABLE trend_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES raw_content(id) ON DELETE CASCADE,
  relevance NUMERIC(5,2) DEFAULT 1.0,
  UNIQUE(trend_id, content_id)
);

CREATE INDEX idx_trend_content_trend ON trend_content(trend_id);
CREATE INDEX idx_trend_content_content ON trend_content(content_id);

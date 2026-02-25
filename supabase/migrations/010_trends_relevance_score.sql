-- Add relevance_score to trends table for brand-relevant scoring
ALTER TABLE trends ADD COLUMN relevance_score NUMERIC(5,2) DEFAULT 0
  CHECK (relevance_score >= 0 AND relevance_score <= 100);

CREATE INDEX idx_trends_relevance ON trends(relevance_score DESC);

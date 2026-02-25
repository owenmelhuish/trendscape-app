ALTER TABLE raw_content ADD COLUMN virality_score REAL;
ALTER TABLE raw_content ADD COLUMN engagement_rate REAL;
CREATE INDEX idx_raw_content_virality ON raw_content(brand_id, virality_score DESC);

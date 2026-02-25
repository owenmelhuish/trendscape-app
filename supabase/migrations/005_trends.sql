-- Create trends table (grouped/analyzed trends)
CREATE TABLE trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hashtag_cluster', 'music', 'meme_format', 'cultural_moment')),
  hashtag_cluster TEXT[] DEFAULT '{}',
  music_id TEXT,
  music_name TEXT,
  velocity_score NUMERIC(5,2) DEFAULT 0 CHECK (velocity_score >= 0 AND velocity_score <= 100),
  breakout_score NUMERIC(5,2) DEFAULT 0 CHECK (breakout_score >= 0 AND breakout_score <= 100),
  category TEXT,
  content_count INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_likes BIGINT DEFAULT 0,
  avg_engagement_rate NUMERIC(7,4) DEFAULT 0,
  first_seen TIMESTAMPTZ DEFAULT now(),
  peak_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'emerging' CHECK (status IN ('emerging', 'active', 'peaking', 'declining', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trends_brand ON trends(brand_id);
CREATE INDEX idx_trends_status ON trends(status);
CREATE INDEX idx_trends_breakout ON trends(breakout_score DESC);
CREATE INDEX idx_trends_type ON trends(type);

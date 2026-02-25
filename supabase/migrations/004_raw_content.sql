-- Create raw_content table (scraped posts)
CREATE TABLE raw_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  scrape_job_id UUID NOT NULL REFERENCES scrape_jobs(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'tiktok',
  post_id TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_name TEXT DEFAULT '',
  caption TEXT DEFAULT '',
  hashtags TEXT[] DEFAULT '{}',
  music_id TEXT,
  music_name TEXT,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  thumbnail_url TEXT,
  video_url TEXT,
  post_created_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, platform, post_id)
);

CREATE INDEX idx_raw_content_brand ON raw_content(brand_id);
CREATE INDEX idx_raw_content_scrape_job ON raw_content(scrape_job_id);
CREATE INDEX idx_raw_content_hashtags ON raw_content USING GIN(hashtags);
CREATE INDEX idx_raw_content_music ON raw_content(music_id);
CREATE INDEX idx_raw_content_post_created ON raw_content(post_created_at);

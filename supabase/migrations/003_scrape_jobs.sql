-- Create scrape_jobs table (track Apify runs)
CREATE TABLE scrape_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'tiktok' CHECK (platform IN ('tiktok')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  apify_run_id TEXT,
  keywords_used TEXT[] DEFAULT '{}',
  items_found INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_scrape_jobs_brand ON scrape_jobs(brand_id);
CREATE INDEX idx_scrape_jobs_status ON scrape_jobs(status);

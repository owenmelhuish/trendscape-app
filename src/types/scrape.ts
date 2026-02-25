export type ScrapeStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ScrapeJob {
  id: string;
  brand_id: string;
  platform: 'tiktok';
  status: ScrapeStatus;
  apify_run_id: string | null;
  keywords_used: string[];
  items_found: number;
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

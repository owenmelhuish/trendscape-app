import type { SupabaseClient } from '@supabase/supabase-js';
import type { Trend, TrendStatus } from '@/types/trend';

export async function getTrendsByBrand(
  supabase: SupabaseClient,
  brandId: string,
  options?: {
    status?: TrendStatus[];
    category?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'breakout_score' | 'velocity_score' | 'created_at';
  }
): Promise<Trend[]> {
  let query = supabase
    .from('trends')
    .select('*')
    .eq('brand_id', brandId);

  if (options?.status?.length) {
    query = query.in('status', options.status);
  }
  if (options?.category) {
    query = query.eq('category', options.category);
  }

  query = query.order(options?.orderBy || 'breakout_score', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTrendById(
  supabase: SupabaseClient,
  trendId: string
): Promise<Trend | null> {
  const { data, error } = await supabase
    .from('trends')
    .select('*')
    .eq('id', trendId)
    .single();

  if (error) return null;
  return data;
}

export async function getTrendWithContent(
  supabase: SupabaseClient,
  trendId: string
) {
  const { data: trend, error: trendError } = await supabase
    .from('trends')
    .select('*')
    .eq('id', trendId)
    .single();

  if (trendError) return null;

  const { data: contentLinks, error: linkError } = await supabase
    .from('trend_content')
    .select(`
      relevance,
      raw_content (*)
    `)
    .eq('trend_id', trendId)
    .order('relevance', { ascending: false });

  if (linkError) throw linkError;

  const contents = (contentLinks || []).map((link: any) => ({
    ...link.raw_content,
    relevance: link.relevance,
  }));

  return { ...trend, contents };
}

export async function getTrendReport(
  supabase: SupabaseClient,
  trendId: string
) {
  const { data, error } = await supabase
    .from('trend_reports')
    .select('*')
    .eq('trend_id', trendId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

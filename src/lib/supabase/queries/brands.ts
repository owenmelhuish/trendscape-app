import type { SupabaseClient } from '@supabase/supabase-js';
import type { Brand, BrandWithRole } from '@/types/brand';

export async function getUserBrands(supabase: SupabaseClient): Promise<BrandWithRole[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('brand_members')
    .select(`
      role,
      brands (*)
    `)
    .eq('user_id', user.id);

  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row.brands,
    role: row.role,
  }));
}

export async function getBrandBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

export async function getBrandById(
  supabase: SupabaseClient,
  id: string
): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

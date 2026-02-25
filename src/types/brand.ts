export interface Brand {
  id: string;
  name: string;
  slug: string;
  industry: string;
  keywords: string[];
  logo_url: string | null;
  primary_color: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandMember {
  id: string;
  brand_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'viewer';
}

export type BrandWithRole = Brand & { role: BrandMember['role'] };

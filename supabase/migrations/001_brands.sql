-- Create brands table (multi-tenant root)
CREATE TABLE brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#14B8A6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_is_active ON brands(is_active);

-- Create brand_members table (user-brand relationships)
CREATE TABLE brand_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(brand_id, user_id)
);

CREATE INDEX idx_brand_members_user ON brand_members(user_id);
CREATE INDEX idx_brand_members_brand ON brand_members(brand_id);

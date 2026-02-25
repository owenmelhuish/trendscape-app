-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_reports ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user has access to a brand
CREATE OR REPLACE FUNCTION user_has_brand_access(check_brand_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM brand_members
    WHERE brand_id = check_brand_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: check if user is admin/owner of a brand
CREATE OR REPLACE FUNCTION user_is_brand_admin(check_brand_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM brand_members
    WHERE brand_id = check_brand_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Brands policies
CREATE POLICY "Users can view brands they belong to"
  ON brands FOR SELECT
  USING (user_has_brand_access(id));

-- Brand members policies
CREATE POLICY "Users can view members of their brands"
  ON brand_members FOR SELECT
  USING (user_has_brand_access(brand_id));

CREATE POLICY "Admins can manage brand members"
  ON brand_members FOR ALL
  USING (user_is_brand_admin(brand_id));

-- Scrape jobs policies
CREATE POLICY "Users can view scrape jobs for their brands"
  ON scrape_jobs FOR SELECT
  USING (user_has_brand_access(brand_id));

-- Raw content policies
CREATE POLICY "Users can view content for their brands"
  ON raw_content FOR SELECT
  USING (user_has_brand_access(brand_id));

-- Trends policies
CREATE POLICY "Users can view trends for their brands"
  ON trends FOR SELECT
  USING (user_has_brand_access(brand_id));

-- Trend content policies (joins through trends)
CREATE POLICY "Users can view trend content for their brands"
  ON trend_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trends
      WHERE trends.id = trend_content.trend_id
      AND user_has_brand_access(trends.brand_id)
    )
  );

-- Trend reports policies
CREATE POLICY "Users can view reports for their brands"
  ON trend_reports FOR SELECT
  USING (user_has_brand_access(brand_id));

ALTER TABLE trends ADD COLUMN format_type TEXT;
ALTER TABLE trends ADD COLUMN format_label TEXT;
ALTER TABLE trends ADD COLUMN music_author TEXT;
CREATE INDEX idx_trends_format_type ON trends(format_type);

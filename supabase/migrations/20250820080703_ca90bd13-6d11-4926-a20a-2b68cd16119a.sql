-- Simplify help system data structure - Phase 2
-- Remove show_video flag and image_url field, use only image_urls array

-- First, migrate any remaining image_url data to image_urls in help_topics
UPDATE help_topics 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END
WHERE image_urls IS NULL;

-- Remove the image_url column from help_topics
ALTER TABLE help_topics DROP COLUMN IF EXISTS image_url;

-- Remove the show_video column from help_topics (auto-show if video_url exists)
ALTER TABLE help_topics DROP COLUMN IF EXISTS show_video;

-- Migrate any remaining image_url data to image_urls in help_topic_sections
UPDATE help_topic_sections 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE COALESCE(image_urls, '[]'::jsonb)
END;

-- Remove the image_url column from help_topic_sections
ALTER TABLE help_topic_sections DROP COLUMN IF EXISTS image_url;

-- Add image_urls column to help_topics if it doesn't exist
ALTER TABLE help_topics ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb;
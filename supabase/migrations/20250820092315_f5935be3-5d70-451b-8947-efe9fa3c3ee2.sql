-- Fix help system data structure - corrected order
-- Add image_urls column to help_topics first
ALTER TABLE help_topics ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb;

-- Migrate any image_url data to image_urls in help_topics
UPDATE help_topics 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END;

-- Migrate any image_url data to image_urls in help_topic_sections  
UPDATE help_topic_sections 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE COALESCE(image_urls, '[]'::jsonb)
END;

-- Now remove the old columns
ALTER TABLE help_topics DROP COLUMN IF EXISTS image_url;
ALTER TABLE help_topics DROP COLUMN IF EXISTS show_video;
ALTER TABLE help_topic_sections DROP COLUMN IF EXISTS image_url;
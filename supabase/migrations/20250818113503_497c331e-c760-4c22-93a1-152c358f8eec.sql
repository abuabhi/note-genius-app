-- Add image_urls column to help_topic_sections table for multiple image support
ALTER TABLE public.help_topic_sections 
ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url data to image_urls array
UPDATE public.help_topic_sections 
SET image_urls = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END
WHERE image_urls = '[]'::jsonb;
-- Fix help_topics: Remove YouTube URLs from image_url and enable videos
UPDATE help_topics 
SET image_url = NULL 
WHERE image_url LIKE '%youtube.com%' OR image_url LIKE '%youtu.be%';

-- Enable video display for all topics that have video URLs
UPDATE help_topics 
SET show_video = true 
WHERE video_url IS NOT NULL AND video_url != '';

-- Clean up corrupted image URLs in help_topic_sections
UPDATE help_topic_sections 
SET image_urls = (
  SELECT jsonb_agg(regexp_replace(url::text, '">.*$', '', 'g'))
  FROM jsonb_array_elements_text(image_urls) AS url
)
WHERE image_urls IS NOT NULL 
  AND image_urls::text LIKE '%">%';

-- Also clean single image_url in sections
UPDATE help_topic_sections 
SET image_url = regexp_replace(image_url, '">.*$', '', 'g')
WHERE image_url IS NOT NULL AND image_url LIKE '%">%';
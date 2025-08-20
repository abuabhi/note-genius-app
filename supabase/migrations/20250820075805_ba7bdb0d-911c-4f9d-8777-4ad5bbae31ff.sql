-- Clean up corrupted image URLs and enable videos
UPDATE help_topics 
SET image_urls = ARRAY(
  SELECT regexp_replace(unnest(image_urls), '">.*$', '', 'g')
  WHERE image_urls IS NOT NULL
)
WHERE image_urls IS NOT NULL AND array_to_string(image_urls, ',') LIKE '%">%';

-- Enable video display for all topics that have video URLs
UPDATE help_topics 
SET show_video = true 
WHERE (video_url IS NOT NULL AND video_url != '') 
   OR (video_title IS NOT NULL AND video_title != '');

-- Fix any remaining data issues
UPDATE help_topics 
SET image_url = NULL 
WHERE image_url LIKE '%youtube.com%' OR image_url LIKE '%youtu.be%';
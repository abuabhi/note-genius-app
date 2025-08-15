-- Reset stuck enhancement statuses to failed so users can retry
UPDATE notes 
SET 
  summary_status = CASE 
    WHEN summary_status = 'generating' THEN 'failed'::text
    ELSE summary_status 
  END,
  enriched_status = CASE 
    WHEN enriched_status = 'generating' THEN 'failed'::text
    ELSE enriched_status 
  END,
  questions_status = CASE 
    WHEN questions_status = 'generating' THEN 'failed'::text
    ELSE questions_status 
  END,
  markdown_content_status = CASE 
    WHEN markdown_content_status = 'generating' THEN 'failed'::text
    ELSE markdown_content_status 
  END,
  key_points_status = CASE 
    WHEN key_points_status = 'generating' THEN 'failed'::text
    ELSE key_points_status 
  END,
  updated_at = now()
WHERE 
  summary_status = 'generating' 
  OR enriched_status = 'generating' 
  OR questions_status = 'generating' 
  OR markdown_content_status = 'generating' 
  OR key_points_status = 'generating';
-- Reset all stuck enhancement statuses to null so they can be regenerated
UPDATE public.notes 
SET 
  summary_status = NULL,
  key_points_status = NULL,
  improved_content_status = NULL,
  markdown_content_status = NULL,
  enriched_status = NULL
WHERE 
  summary_status = 'generating' 
  OR key_points_status = 'generating'
  OR improved_content_status = 'generating' 
  OR markdown_content_status = 'generating'
  OR enriched_status = 'generating'
  OR summary_status = 'failed'
  OR key_points_status = 'failed'
  OR improved_content_status = 'failed'
  OR markdown_content_status = 'failed'
  OR enriched_status = 'failed';
-- Reset stuck enhancement statuses to null
UPDATE public.notes 
SET 
  summary_status = NULL,
  key_points_status = NULL,
  improved_content_status = NULL,
  markdown_content_status = NULL,
  enriched_status = NULL
WHERE 
  summary_status = 'pending' 
  OR key_points_status = 'pending'
  OR improved_content_status = 'pending' 
  OR markdown_content_status = 'pending'
  OR enriched_status = 'pending';

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_notes_enhancement_statuses 
ON public.notes (summary_status, key_points_status, improved_content_status, markdown_content_status, enriched_status);
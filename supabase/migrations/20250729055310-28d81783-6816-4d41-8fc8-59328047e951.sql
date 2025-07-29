-- STEP 1: Reset ALL enhancement statuses for the stuck note
UPDATE public.notes 
SET 
  summary_status = 'pending',
  summary_generated_at = NULL,
  key_points_status = 'pending', 
  key_points_generated_at = NULL,
  markdown_content_status = 'pending',
  markdown_content_generated_at = NULL,
  questions_status = 'pending',
  questions_generated_at = NULL,
  enriched_status = 'pending',
  enriched_content_generated_at = NULL,
  updated_at = now()
WHERE id = '1923fa8f-6181-4b9c-841e-208ac5037ba5';
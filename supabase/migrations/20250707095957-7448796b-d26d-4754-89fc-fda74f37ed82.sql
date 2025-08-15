-- Fix the auto-generation issue by cleaning up existing pending statuses with no content

-- Update individual fields that are 'pending' with no content to NULL
UPDATE public.notes 
SET summary_status = NULL 
WHERE summary_status = 'pending' AND (summary IS NULL OR summary = '');

UPDATE public.notes 
SET key_points_status = NULL 
WHERE key_points_status = 'pending' AND (key_points IS NULL OR key_points = '');

UPDATE public.notes 
SET markdown_content_status = NULL 
WHERE markdown_content_status = 'pending' AND (markdown_content IS NULL OR markdown_content = '');

UPDATE public.notes 
SET improved_content_status = NULL 
WHERE improved_content_status = 'pending' AND (improved_content IS NULL OR improved_content = '');

UPDATE public.notes 
SET enriched_status = NULL 
WHERE enriched_status = 'pending' AND (enriched_content IS NULL OR enriched_content = '');
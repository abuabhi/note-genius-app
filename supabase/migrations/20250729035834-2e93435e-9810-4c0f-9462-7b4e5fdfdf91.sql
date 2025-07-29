-- Reset stuck key_points_status for the specific note
UPDATE public.notes 
SET key_points_status = 'pending',
    key_points_generated_at = NULL,
    updated_at = now()
WHERE id = 'c5aa5a2c-8192-4f66-874b-120ff59452e7' 
AND key_points_status = 'generating';

-- Add missing status fields for comprehensive enhancement tracking
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS key_points_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS markdown_content_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS improved_content_status TEXT DEFAULT 'pending';

-- Add check constraints for the new status fields
ALTER TABLE public.notes 
ADD CONSTRAINT key_points_status_check 
CHECK (key_points_status IN ('pending', 'generating', 'completed', 'failed'));

ALTER TABLE public.notes 
ADD CONSTRAINT markdown_content_status_check 
CHECK (markdown_content_status IN ('pending', 'generating', 'completed', 'failed'));

ALTER TABLE public.notes 
ADD CONSTRAINT improved_content_status_check 
CHECK (improved_content_status IN ('pending', 'generating', 'completed', 'failed'));

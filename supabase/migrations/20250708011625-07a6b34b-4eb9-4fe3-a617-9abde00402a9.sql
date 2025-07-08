-- PHASE 1: Add missing generated_at columns to notes table
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS summary_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS key_points_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS improved_content_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS markdown_content_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS enriched_content_generated_at TIMESTAMP WITH TIME ZONE;

-- Reset all stuck enhancement statuses to NULL for fresh start
UPDATE public.notes 
SET 
  summary_status = NULL,
  key_points_status = NULL,
  improved_content_status = NULL,
  markdown_content_status = NULL,
  enriched_status = NULL
WHERE 
  summary_status IN ('generating', 'failed', 'pending')
  OR key_points_status IN ('generating', 'failed', 'pending')
  OR improved_content_status IN ('generating', 'failed', 'pending') 
  OR markdown_content_status IN ('generating', 'failed', 'pending')
  OR enriched_status IN ('generating', 'failed', 'pending');

-- Add indexes for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_notes_enhancement_statuses 
ON public.notes (summary_status, key_points_status, improved_content_status, markdown_content_status, enriched_status);
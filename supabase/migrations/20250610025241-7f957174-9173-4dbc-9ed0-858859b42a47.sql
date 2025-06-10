
-- Add enriched content fields to the notes table
ALTER TABLE public.notes 
ADD COLUMN enriched_content text,
ADD COLUMN enriched_content_generated_at timestamp with time zone,
ADD COLUMN enriched_status text DEFAULT 'pending';

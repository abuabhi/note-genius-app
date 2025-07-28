-- Add questions fields to notes table
ALTER TABLE public.notes 
ADD COLUMN questions_content text,
ADD COLUMN questions_status text DEFAULT 'pending' CHECK (questions_status IN ('pending', 'generating', 'completed', 'failed')),
ADD COLUMN questions_generated_at timestamp with time zone;
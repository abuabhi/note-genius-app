-- Add image_url column to help_topics table
ALTER TABLE public.help_topics 
ADD COLUMN image_url TEXT;
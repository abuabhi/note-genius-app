-- Add is_default field to study_music_tracks table
ALTER TABLE public.study_music_tracks 
ADD COLUMN is_default boolean NOT NULL DEFAULT false;

-- Create unique constraint to ensure only one default track
CREATE UNIQUE INDEX study_music_tracks_single_default_idx 
ON public.study_music_tracks (is_default) 
WHERE is_default = true;

-- Set the first active track as default if no default exists
UPDATE public.study_music_tracks 
SET is_default = true 
WHERE id = (
  SELECT id 
  FROM public.study_music_tracks 
  WHERE is_active = true 
  ORDER BY created_at ASC 
  LIMIT 1
) 
AND NOT EXISTS (
  SELECT 1 
  FROM public.study_music_tracks 
  WHERE is_default = true
);
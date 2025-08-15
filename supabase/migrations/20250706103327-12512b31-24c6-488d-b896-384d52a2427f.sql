-- Add YouTube-specific fields to notes table
ALTER TABLE public.notes 
ADD COLUMN video_url TEXT,
ADD COLUMN video_metadata JSONB DEFAULT '{}'::jsonb;

-- Add 'youtube' to source_type enum
ALTER TYPE source_type ADD VALUE 'youtube';

-- Add index for video URL lookups
CREATE INDEX IF NOT EXISTS idx_notes_video_url ON public.notes(video_url) WHERE video_url IS NOT NULL;

-- Add index for YouTube notes
CREATE INDEX IF NOT EXISTS idx_notes_youtube_source ON public.notes(source_type) WHERE source_type = 'youtube';
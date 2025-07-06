-- Add YouTube-specific fields to notes table
ALTER TABLE public.notes 
ADD COLUMN video_url TEXT,
ADD COLUMN video_metadata JSONB DEFAULT '{}'::jsonb;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_video_url ON public.notes(video_url) WHERE video_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_youtube_source ON public.notes(source_type) WHERE source_type = 'youtube';

-- Add constraint to allow 'youtube' as valid source_type (extending existing values)
-- The column already allows text values, so we just document the valid values
COMMENT ON COLUMN public.notes.source_type IS 'Valid values: manual, scan, import, youtube';

-- Add comment for new video fields
COMMENT ON COLUMN public.notes.video_url IS 'Original YouTube URL for video-based notes';
COMMENT ON COLUMN public.notes.video_metadata IS 'Video metadata including title, duration, thumbnail, channel info';
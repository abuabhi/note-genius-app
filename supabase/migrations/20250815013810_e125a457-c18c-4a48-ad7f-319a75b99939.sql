-- Add study music preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN study_music_preferences JSONB DEFAULT '{"selectedTracks": []}';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.study_music_preferences IS 'User selected study music tracks from Pixabay API';

-- Create index for performance
CREATE INDEX idx_profiles_study_music_preferences ON public.profiles USING GIN(study_music_preferences);
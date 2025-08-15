-- Create study_music_tracks table for admin-managed music
CREATE TABLE public.study_music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  audio_file_path TEXT NOT NULL, -- Path to audio file in storage
  thumbnail_path TEXT, -- Path to thumbnail in storage
  duration_seconds INTEGER,
  category TEXT DEFAULT 'lofi',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.study_music_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for study_music_tracks
CREATE POLICY "Anyone can view active tracks" 
ON public.study_music_tracks 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "DEAN users can manage tracks" 
ON public.study_music_tracks 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND user_tier = 'DEAN'
));

-- Create user_selected_music_track table to replace the current system
CREATE TABLE public.user_selected_music_track (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.study_music_tracks(id) ON DELETE CASCADE,
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- Ensure only one selected track per user
);

-- Enable RLS
ALTER TABLE public.user_selected_music_track ENABLE ROW LEVEL SECURITY;

-- Create policies for user_selected_music_track
CREATE POLICY "Users can manage their own selected track" 
ON public.user_selected_music_track 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_study_music_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_music_tracks_updated_at
BEFORE UPDATE ON public.study_music_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_study_music_tracks_updated_at();

-- Insert default tracks (to be replaced with real audio files later)
INSERT INTO public.study_music_tracks (name, artist, audio_file_path, thumbnail_path, duration_seconds, sort_order) VALUES
('Lofi Hip Hop Study Mix', 'Study Beats', 'tracks/lofi-hip-hop-study-mix.mp3', 'thumbnails/lofi-hip-hop.jpg', 1800, 1),
('Calm Piano Focus', 'Peaceful Keys', 'tracks/calm-piano-focus.mp3', 'thumbnails/calm-piano.jpg', 1650, 2),
('Forest Rain Ambience', 'Nature Sounds', 'tracks/forest-rain-ambience.mp3', 'thumbnails/forest-rain.jpg', 2100, 3),
('Chillhop Instrumental', 'Beat Makers', 'tracks/chillhop-instrumental.mp3', 'thumbnails/chillhop.jpg', 1920, 4),
('Classical Study Session', 'Bach & Friends', 'tracks/classical-study-session.mp3', 'thumbnails/classical.jpg', 2400, 5);

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-music', 'study-music', true) 
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for study-music bucket
CREATE POLICY "Anyone can view study music files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'study-music');

CREATE POLICY "DEAN users can upload study music files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'study-music' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  )
);

CREATE POLICY "DEAN users can update study music files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'study-music' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  )
);

CREATE POLICY "DEAN users can delete study music files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'study-music' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  )
);
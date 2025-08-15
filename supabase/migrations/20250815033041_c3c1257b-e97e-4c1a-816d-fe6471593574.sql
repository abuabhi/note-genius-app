-- Migrate existing hardcoded tracks to database
-- This migration adds sample tracks to the study_music_tracks table

-- Clear any existing test data first
DELETE FROM public.study_music_tracks WHERE created_by IS NULL;

-- Insert default tracks (admin will replace with real audio files)
INSERT INTO public.study_music_tracks (name, artist, audio_file_path, thumbnail_path, duration_seconds, category, tags, sort_order) VALUES
('Lofi Hip Hop Study Mix', 'ChillHop Music', 'tracks/placeholder/lofi-hip-hop-study-mix.mp3', 'thumbnails/placeholder/lofi-hip-hop.jpg', 1800, 'lofi', ARRAY['lofi', 'chill', 'focus'], 1),
('Calm Piano Focus', 'Peaceful Keys', 'tracks/placeholder/calm-piano-focus.mp3', 'thumbnails/placeholder/calm-piano.jpg', 1650, 'classical', ARRAY['piano', 'classical', 'calm'], 2),
('Forest Rain Ambience', 'Nature Sounds', 'tracks/placeholder/forest-rain-ambience.mp3', 'thumbnails/placeholder/forest-rain.jpg', 2100, 'nature', ARRAY['rain', 'nature', 'ambient'], 3),
('Chillhop Instrumental', 'Beat Makers', 'tracks/placeholder/chillhop-instrumental.mp3', 'thumbnails/placeholder/chillhop.jpg', 1920, 'lofi', ARRAY['chillhop', 'instrumental', 'beats'], 4),
('Classical Study Session', 'Bach & Friends', 'tracks/placeholder/classical-study-session.mp3', 'thumbnails/placeholder/classical.jpg', 2400, 'classical', ARRAY['classical', 'baroque', 'focus'], 5),
('Ocean Waves Meditation', 'Zen Sounds', 'tracks/placeholder/ocean-waves.mp3', 'thumbnails/placeholder/ocean-waves.jpg', 3000, 'nature', ARRAY['ocean', 'waves', 'meditation'], 6),
('Coffee Shop Jazz', 'Smooth Jazz Collective', 'tracks/placeholder/coffee-shop-jazz.mp3', 'thumbnails/placeholder/coffee-jazz.jpg', 2700, 'jazz', ARRAY['jazz', 'coffee', 'smooth'], 7),
('Ambient Space Drone', 'Cosmic Sounds', 'tracks/placeholder/ambient-space.mp3', 'thumbnails/placeholder/space-ambient.jpg', 3600, 'ambient', ARRAY['ambient', 'space', 'drone'], 8),
('Study Beats Vol. 1', 'Focus Beats', 'tracks/placeholder/study-beats-v1.mp3', 'thumbnails/placeholder/study-beats.jpg', 2100, 'lofi', ARRAY['beats', 'study', 'hip-hop'], 9),
('Nordic Folk Acoustic', 'Folk Collective', 'tracks/placeholder/nordic-folk.mp3', 'thumbnails/placeholder/nordic-folk.jpg', 1980, 'folk', ARRAY['folk', 'acoustic', 'nordic'], 10),
('Deep Focus Synth', 'Synthwave Studio', 'tracks/placeholder/deep-focus-synth.mp3', 'thumbnails/placeholder/synthwave.jpg', 2880, 'electronic', ARRAY['synth', 'electronic', 'focus'], 11),
('Minimalist Piano', 'Simple Melodies', 'tracks/placeholder/minimalist-piano.mp3', 'thumbnails/placeholder/minimal-piano.jpg', 1560, 'classical', ARRAY['piano', 'minimalist', 'peaceful'], 12),
('Thunderstorm Study', 'Weather Sounds', 'tracks/placeholder/thunderstorm.mp3', 'thumbnails/placeholder/thunderstorm.jpg', 2400, 'nature', ARRAY['thunder', 'rain', 'storm'], 13),
('Lo-fi Vinyl Crackle', 'Retro Vibes', 'tracks/placeholder/vinyl-crackle.mp3', 'thumbnails/placeholder/vinyl.jpg', 2160, 'lofi', ARRAY['vinyl', 'retro', 'crackle'], 14),
('Zen Garden Meditation', 'Mindful Music', 'tracks/placeholder/zen-garden.mp3', 'thumbnails/placeholder/zen-garden.jpg', 2700, 'meditation', ARRAY['zen', 'meditation', 'peaceful'], 15);

-- Set default user selections for existing users (first track - Lofi Hip Hop)
INSERT INTO public.user_selected_music_track (user_id, track_id)
SELECT 
  p.id as user_id,
  (SELECT id FROM public.study_music_tracks WHERE name = 'Lofi Hip Hop Study Mix' LIMIT 1) as track_id
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_selected_music_track usmt 
  WHERE usmt.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;
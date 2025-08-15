-- Fix audio file paths to be URL-safe (remove spaces and special characters)
UPDATE study_music_tracks 
SET audio_file_path = CASE 
  WHEN id = '0741d13b-2ba1-46f0-849d-093b8a2db8bd' THEN 'tracks/focus-flow-study-sessions.mp3'
  WHEN id = 'e1603ab8-5807-42a4-a652-ab6c7c48bf37' THEN 'tracks/deep-study-mode-productivity.mp3'
  WHEN id = 'b9ffebb8-9526-4818-a5f3-7b584a1ab1c1' THEN 'tracks/mind-motion-focused-hours.mp3'
  ELSE audio_file_path
END;
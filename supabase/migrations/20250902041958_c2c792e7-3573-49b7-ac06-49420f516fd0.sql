-- Add video URL settings to admin_settings table for dynamic video management
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
('video_hero_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_notes_import_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_flashcard_generation_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_smart_quizzes_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_ai_chat_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_study_plans_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_todo_focus_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_analytics_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_timer_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_goals_progress_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0'),
('video_resources_url', 'https://www.youtube.com/watch?v=UR94FhzUOg0')
ON CONFLICT (setting_key) DO UPDATE SET 
setting_value = EXCLUDED.setting_value,
updated_at = now();
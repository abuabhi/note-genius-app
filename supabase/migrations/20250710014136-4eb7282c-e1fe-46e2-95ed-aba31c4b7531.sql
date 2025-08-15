-- Reset account for user onlineab9@gmail.com (user_id: 1bf8c758-f0ee-4b69-9eb7-c87aa99651ef)
-- Fixed version with correct table relationships

-- Step 1: Clear all user data in dependency order
-- Clear note-related data first
DELETE FROM public.note_enrichment_usage WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.note_chat_messages WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.note_content_expansions WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.note_tags WHERE note_id IN (SELECT id FROM public.notes WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef');
DELETE FROM public.scan_data WHERE note_id IN (SELECT id FROM public.notes WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef');

-- Clear notes
DELETE FROM public.notes WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear flashcard and learning data
DELETE FROM public.user_flashcard_progress WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.learning_progress WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear flashcard sets and related data
DELETE FROM public.flashcard_set_cards WHERE set_id IN (SELECT id FROM public.flashcard_sets WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef');
DELETE FROM public.flashcard_sets WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.flashcards WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear study data
DELETE FROM public.study_sessions WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.study_goals WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.study_plans WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear reminders and todos
DELETE FROM public.reminders WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear quiz data (using correct relationships)
DELETE FROM public.quiz_question_responses WHERE result_id IN (SELECT id FROM public.quiz_results WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef');
DELETE FROM public.quiz_results WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.quizzes WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear test data
DELETE FROM public.test_question_attempts WHERE test_session_id IN (SELECT id FROM public.test_sessions WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef');
DELETE FROM public.test_sessions WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear user subjects
DELETE FROM public.user_subjects WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear email preferences
DELETE FROM public.email_digest_preferences WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear learning and analytics data
DELETE FROM public.learning_insights WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.learning_patterns WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.learning_velocity_metrics WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.content_analysis_cache WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.topic_suggestions_cache WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.user_topic_progress WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear help and analytics
DELETE FROM public.help_content_analytics WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.help_search_analytics WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.help_session_analytics WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear feedback
DELETE FROM public.feedback WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear referrals and contests
DELETE FROM public.referrals WHERE referrer_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef' OR referred_user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';
DELETE FROM public.contest_entries WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Clear digest cache
DELETE FROM public.digest_content_cache WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Step 2: Reset profile to onboarding state
UPDATE public.profiles 
SET 
  onboarding_completed = false,
  first_name = null,
  grade = null,
  school = null,
  updated_at = now()
WHERE id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Verification: Check that user profile exists and is reset
SELECT id, username, first_name, onboarding_completed, user_tier, created_at 
FROM public.profiles 
WHERE id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef';

-- Extend email_digest_preferences table to include new content types
ALTER TABLE public.email_digest_preferences 
ADD COLUMN IF NOT EXISTS include_notes boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS include_flashcards boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS include_quizzes boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS include_study_sessions boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notes_limit integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS flashcards_limit integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS quizzes_limit integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS study_sessions_limit integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS include_streaks boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS include_recommendations boolean DEFAULT true;

-- Add indexes for better performance on digest queries
CREATE INDEX IF NOT EXISTS idx_notes_user_updated_at ON public.notes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user_updated_at ON public.flashcard_sets(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_completed_at ON public.quiz_results(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_start_time ON public.study_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_reviewed ON public.user_flashcard_progress(user_id, last_reviewed_at DESC);

-- Fix RLS policy for user management
CREATE POLICY "DEAN users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- Add database indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_profiles_user_tier ON public.profiles(user_tier);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id_start_time ON public.study_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_id_updated_at ON public.notes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id_status ON public.reminders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_id_reviewed ON public.user_flashcard_progress(user_id, last_reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id_completed ON public.quiz_results(user_id, completed_at DESC);
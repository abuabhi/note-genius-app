
-- 1. Dashboard counts RPC: collapse 4 round-trips into 1
CREATE OR REPLACE FUNCTION public.dashboard_counts(_user_id uuid)
RETURNS TABLE (
  notes_count bigint,
  flashcard_sets_count bigint,
  quizzes_count bigint,
  active_goals_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.notes WHERE user_id = _user_id AND archived IS NOT TRUE),
    (SELECT count(*) FROM public.flashcard_sets WHERE user_id = _user_id),
    (SELECT count(*) FROM public.quizzes WHERE user_id = _user_id),
    (SELECT count(*) FROM public.study_goals WHERE user_id = _user_id AND is_completed = false);
$$;

REVOKE ALL ON FUNCTION public.dashboard_counts(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.dashboard_counts(uuid) TO authenticated;

-- 2. Quiz attempt drafts: persist in-progress answers to survive reload/crash
CREATE TABLE IF NOT EXISTS public.quiz_attempts_draft (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quiz_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_question int NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quiz_id)
);

ALTER TABLE public.quiz_attempts_draft ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own quiz drafts"
  ON public.quiz_attempts_draft FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own quiz drafts"
  ON public.quiz_attempts_draft FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own quiz drafts"
  ON public.quiz_attempts_draft FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own quiz drafts"
  ON public.quiz_attempts_draft FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_quiz_attempts_draft_updated_at
  BEFORE UPDATE ON public.quiz_attempts_draft
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Performance indexes for hot dashboard queries
CREATE INDEX IF NOT EXISTS idx_notes_user_created ON public.notes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_start ON public.study_sessions (user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_created ON public.quiz_results (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_goals_user_created ON public.study_goals (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON public.reminders (user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user ON public.flashcard_sets (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quizzes_user ON public.quizzes (user_id, created_at DESC);

-- 4. AI quality feedback type expansion (uses existing feedback table — type column is text)
-- No schema change needed; documenting expected values: 'ai_quality_quiz', 'ai_quality_enrichment', 'ai_quality_chat'

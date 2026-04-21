-- 1. Add kind column
ALTER TABLE public.study_goals
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'goal'
  CHECK (kind IN ('goal','task'));

-- 2. Allow tasks (no hours, no end date)
ALTER TABLE public.study_goals ALTER COLUMN target_hours DROP NOT NULL;
ALTER TABLE public.study_goals ALTER COLUMN end_date DROP NOT NULL;

-- 3. Backfill existing rows as goals
UPDATE public.study_goals SET kind = 'goal' WHERE kind IS NULL;

-- 4. Copy todos from reminders into study_goals as tasks
INSERT INTO public.study_goals (
  user_id, title, description, kind,
  target_hours, start_date, end_date,
  is_completed, progress, status,
  created_at, updated_at
)
SELECT
  r.user_id,
  r.title,
  r.description,
  'task'::text,
  NULL::integer,
  COALESCE(r.created_at::date, CURRENT_DATE),
  r.due_date,
  COALESCE(r.status = 'completed', false),
  CASE WHEN r.status = 'completed' THEN 100 ELSE 0 END,
  CASE WHEN r.status = 'completed' THEN 'completed' ELSE 'active' END,
  COALESCE(r.created_at, now()),
  COALESCE(r.updated_at, now())
FROM public.reminders r
WHERE r.type = 'todo'
  AND r.auto_archived_at IS NULL
  AND NOT EXISTS (
    -- safety: don't double-insert if migration runs twice
    SELECT 1 FROM public.study_goals sg
    WHERE sg.user_id = r.user_id
      AND sg.title = r.title
      AND sg.kind = 'task'
      AND sg.created_at = r.created_at
  );

-- 5. Archive the migrated todo reminders so they stop showing in todo lists
UPDATE public.reminders
SET auto_archived_at = now(),
    archived_reason = 'Migrated to study_goals as task',
    updated_at = now()
WHERE type = 'todo' AND auto_archived_at IS NULL;

-- 6. Index for common dashboard query
CREATE INDEX IF NOT EXISTS idx_study_goals_user_kind ON public.study_goals(user_id, kind);
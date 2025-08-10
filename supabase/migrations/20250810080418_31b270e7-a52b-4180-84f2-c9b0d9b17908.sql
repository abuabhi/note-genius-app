
-- 1) Normalize reminder statuses: set any unknown status to 'pending'
UPDATE public.reminders
SET status = 'pending',
    updated_at = now()
WHERE status NOT IN ('pending', 'sent', 'dismissed', 'completed', 'cancelled');

-- 2) Backfill missing goal_deadline reminders for overdue active goals
INSERT INTO public.reminders (
  user_id,
  title,
  description,
  reminder_time,
  due_date,
  type,
  status,
  priority,
  delivery_methods,
  recurrence,
  goal_id,
  created_at,
  updated_at
)
SELECT
  g.user_id,
  'Goal due: ' || COALESCE(g.title, 'Untitled Goal'),
  NULL,
  now(),
  g.end_date,
  'goal_deadline',
  'pending',
  'high',
  '["in_app"]'::jsonb,
  'none',
  g.id,
  now(),
  now()
FROM public.study_goals g
WHERE g.status = 'active'
  AND g.end_date <= CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1
    FROM public.reminders r
    WHERE r.user_id = g.user_id
      AND r.goal_id = g.id
      AND r.type = 'goal_deadline'
      AND r.status IN ('pending', 'sent')
  );

-- 3) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_reminders_user_status_time
  ON public.reminders (user_id, status, reminder_time);

CREATE INDEX IF NOT EXISTS idx_note_enrichment_usage_user_month
  ON public.note_enrichment_usage (user_id, month_year);

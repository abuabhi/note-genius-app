-- Backfill calendar events for exams that were created without one,
-- so reminders can be attached and they appear in /schedule.
WITH to_link AS (
  SELECT id, user_id, title, exam_date, notes
  FROM public.exams
  WHERE event_id IS NULL
),
inserted AS (
  INSERT INTO public.events (user_id, title, description, start_time, end_time, all_day, event_type, color)
  SELECT
    user_id,
    'Exam: ' || title,
    notes,
    exam_date,
    exam_date + interval '1 hour',
    true,
    'exam',
    '#ef4444'
  FROM to_link
  RETURNING id, user_id, title, start_time
)
UPDATE public.exams e
SET event_id = i.id
FROM inserted i
WHERE e.user_id = i.user_id
  AND ('Exam: ' || e.title) = i.title
  AND e.exam_date = i.start_time
  AND e.event_id IS NULL;
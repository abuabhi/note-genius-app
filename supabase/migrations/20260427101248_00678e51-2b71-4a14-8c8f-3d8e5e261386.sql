
-- Add Extended Investigation subject and exam milestones for user 5ee84402-a28d-4a83-b757-a8f1d4be8cb7
WITH new_subject AS (
  INSERT INTO public.user_subjects (user_id, name)
  VALUES ('5ee84402-a28d-4a83-b757-a8f1d4be8cb7', 'Extended Investigation')
  ON CONFLICT DO NOTHING
  RETURNING id
),
subj AS (
  SELECT id FROM new_subject
  UNION ALL
  SELECT id FROM public.user_subjects
  WHERE user_id = '5ee84402-a28d-4a83-b757-a8f1d4be8cb7' AND name = 'Extended Investigation'
  LIMIT 1
)
INSERT INTO public.exams (user_id, subject_id, title, exam_date, notes, status)
SELECT '5ee84402-a28d-4a83-b757-a8f1d4be8cb7', subj.id, t.title, t.exam_date, t.notes, 'upcoming'
FROM subj,
(VALUES
  ('Draft approach submission', '2026-05-01 09:00:00+00'::timestamptz, 'Extended Investigation: Draft approach to be submitted'),
  ('Final submission of approach', '2026-05-08 09:00:00+00'::timestamptz, 'Extended Investigation: Final submission of approach'),
  ('Oral presentation', '2026-05-15 09:00:00+00'::timestamptz, 'Extended Investigation: Oral presentation'),
  ('Critical Thinking Test - Trial 1', '2026-05-23 09:00:00+00'::timestamptz, 'Extended Investigation: Critical Thinking Test trial'),
  ('Critical Thinking Test - Trial 2', '2026-06-01 09:00:00+00'::timestamptz, 'Extended Investigation: Critical Thinking Test trial'),
  ('SAC - Final submission', '2026-09-05 09:00:00+00'::timestamptz, 'Extended Investigation: School Assessment Coursework final submission')
) AS t(title, exam_date, notes);

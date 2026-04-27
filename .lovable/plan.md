# Fix exam reminders, urgency styling & Schedule visibility

## What's actually wrong

I queried your database — all 6 Extended Investigation exams I added in the last migration have `event_id = NULL`. That's why:

1. **You can't set reminders** — the panel requires a linked calendar event.
2. **They don't appear on `/schedule`** — the Schedule reads from the `events` table, not `exams`.
3. **There is no 30-Apr exam** in your account. Your earliest one is **1-May "Draft approach submission"** (4 days away). It's missing from "Upcoming Events (Next 7 Days)" for the same reason — no event row exists for it.

The bulk migration skipped the calendar-event creation step that the normal "Add Exam" form does. I'll fix this for good.

## What I'll change

### 1. Backfill calendar events for existing exams (data migration)
For every exam where `event_id IS NULL`, create an `events` row (`event_type = 'exam'`, all-day, red color) and link it back via `exams.event_id`. This will:
- Enable the reminders panel for all 6 Extended Investigation milestones.
- Make the 1-May milestone appear in the Schedule and in "Upcoming Events (Next 7 Days)".

### 2. Reminders panel — never show the dead-end message
Instead of telling the user "re-create the exam", the panel will offer a **"Enable reminders"** button that creates the missing calendar event on the fly, then proceeds normally. No more recreating exams.

### 3. Target Readiness — make it meaningful or remove it
Currently it's a number stored on the exam (default 80%) shown only as text on the detail page, with no actionable purpose. Two options — I'll go with **(b)** unless you say otherwise:

- (a) Remove the field from the UI entirely.
- (b) **Keep it but explain it**: add a tooltip/helper — *"Your goal confidence level. The progress bar fills relative to this target so 'ready' means hitting your own bar, not 100%."* Already wired into the progress calc on `ExamDetailPage`. Also surface a small "On track / Behind" badge when `readiness >= target_readiness`.

### 4. ≤7-day urgency styling
Anywhere an exam is listed (Exam Prep list, Upcoming Exams widget, Exam Detail header, Schedule upcoming list when type=exam):
- **≤ 1 day**: red badge "Tomorrow" / "Today", red left border.
- **≤ 3 days**: orange badge "In Nd", orange left border.
- **≤ 7 days**: amber badge "In Nd", subtle amber accent.
- **> 7 days**: current neutral styling.

Driven by a single `getExamUrgency(daysUntil)` helper returning `{ tone, label, className }` so it stays consistent.

### 5. Schedule integration
Once step 1 backfills the events, exams automatically show up on `/schedule` (as red all-day events) and in the next-7-days list. The urgency styling from step 4 will also be applied to event cards where `event_type === 'exam'`.

## Technical details

**Files to change**
- `supabase/migrations/<new>.sql` — backfill events + link `exams.event_id` for all rows where it's null (scoped to the affected user, or all users — safe either way since condition is `event_id IS NULL`).
- `src/components/exam-prep/ExamRemindersPanel.tsx` — replace the warning block with an inline "Enable reminders" mutation that inserts an event and patches `exams.event_id`, then refetches.
- `src/hooks/exams/useExams.ts` — export a small `attachCalendarEventToExam(exam)` mutation reused by the panel.
- `src/utils/examUrgency.ts` (new) — `getExamUrgency(daysUntil)` helper.
- `src/components/exam-prep/UpcomingExamsWidget.tsx`, `src/pages/ExamPrepPage.tsx` (list cards), `src/pages/ExamDetailPage.tsx` header, `src/components/schedule/UpcomingEventsList.tsx` — apply urgency classes/badge.
- `src/pages/ExamDetailPage.tsx` + `src/components/exam-prep/ExamFormDialog.tsx` — add tooltip/helper text for Target Readiness; show "On track / Behind" badge.

**Backfill SQL shape**
```sql
WITH to_link AS (
  SELECT id, user_id, title, exam_date, notes
  FROM public.exams
  WHERE event_id IS NULL
),
inserted AS (
  INSERT INTO public.events (user_id, title, description, start_time, end_time, all_day, event_type, color)
  SELECT user_id, 'Exam: ' || title, notes, exam_date, exam_date + interval '1 hour',
         true, 'exam', '#ef4444'
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
```

No schema changes, no RLS changes.

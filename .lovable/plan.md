## Exam Preparation Tracker — Integration-First Design

The app already has most of the building blocks. The exam tracker should be a **thin coordinating layer** on top of them, not a parallel system.

---

### What we already have (and how exams will reuse each)

| Existing feature | Table / location | Role in Exam Prep |
|---|---|---|
| **Subjects** | `user_subjects` (managed in onboarding `SubjectStep` + Settings) | Source of truth for subject dropdown when creating an exam. No new subject UI. |
| **Notes** | `notes.subject_id`, `notes.subject` | Linkable to exam topics; auto-suggested by matching subject. |
| **Flashcard sets** | `flashcard_sets.subject_id`, `subject`, `topic` | Linkable; `topic` field auto-matches exam topic name. |
| **Quizzes** | `quizzes.subject_id` | Linkable; "Generate quiz from this topic" reuses existing `generate-quiz` edge function. |
| **Goals & Todos** | `study_goals` (`kind` discriminates goal vs todo) | An exam topic can spawn a todo ("Finish chapter 3") or a goal ("10h on calculus") — written into `study_goals` with `academic_subject` set. No duplicate todo system. |
| **Schedule / Calendar** | `events` (already has `event_type`, `flashcard_set_id`) | Each exam writes one `events` row (`event_type='exam'`, `all_day=true`) so it shows on the existing calendar with no extra UI. |
| **Reminders** | `reminders` (already supports `event_id`, `goal_id`) | "Remind me 7/3/1 days before exam" creates `reminders` rows pointing at the exam's event. Reuses existing reminder pipeline + cron. |
| **Study Plans** | `study_plans` (already has `topics jsonb`, `subject`, `end_date`) | Offer "Create a study plan for this exam" — pre-fills CreateStudyPlanForm with subject, end_date=exam_date, topics from exam topics. `study_plans.is_converted_to_goals` already wires sessions back into goals. |
| **Study sessions** | `study_sessions`, `study_plan_sessions` | Time logged for the exam's subject already counts toward readiness via existing analytics. |
| **Dashboard widgets** | `IntermediateDashboard`, `AdvancedDashboard` | Add an "Upcoming Exams" widget alongside existing widgets. |
| **Sidebar nav** | `useNavigationFeatures` | Add `isExamPrepVisible` flag + nav entry. |

---

### What's actually new (minimum)

Only **two** new tables — everything else is a foreign key / link.

```sql
exams (
  id uuid pk,
  user_id uuid not null,
  subject_id uuid references user_subjects(id) on delete set null,
  title text not null,
  exam_date timestamptz not null,
  location text,
  notes text,
  target_readiness int default 80,
  status text default 'upcoming',     -- upcoming | completed | archived
  event_id uuid references events(id) on delete set null,  -- back-link to calendar
  study_plan_id uuid references study_plans(id) on delete set null, -- optional
  created_at, updated_at
)

exam_topics (
  id uuid pk,
  exam_id uuid references exams(id) on delete cascade,
  user_id uuid not null,
  name text not null,
  weight int default 1,
  status text default 'not_started',  -- not_started | learning | reviewing | confident
  position int default 0,
  -- Optional inline links (most common case: one note + one set + one quiz per topic)
  -- Anything beyond inline goes into the polymorphic table below.
  created_at, updated_at
)

exam_topic_links (
  id uuid pk,
  topic_id uuid references exam_topics(id) on delete cascade,
  user_id uuid not null,
  resource_type text not null,        -- note | flashcard_set | quiz | goal
  resource_id uuid not null,
  created_at,
  unique(topic_id, resource_type, resource_id)
)
```

RLS: `user_id = auth.uid()` on all three. Indexes: `(user_id, exam_date)`, `(exam_id, position)`, `(topic_id)`.

**No new table for** todos, goals, reminders, calendar events, study sessions, subjects, or analytics — all reused.

---

### Integration flows

**1. Create exam → ripple effects**
- Insert `exams` row.
- Auto-create `events` row (`event_type='exam'`, `start_time=exam_date`, `all_day=true`, `color` from exam subject) and store its id on `exams.event_id`.
- Offer (checkbox in dialog): "Remind me 7 / 3 / 1 day before" → creates 3 `reminders` rows linked to the event_id.

**2. Add a topic → smart suggestions**
- When user types a topic name, query `notes`, `flashcard_sets` (where `topic ILIKE name`), and `quizzes` filtered by the exam's subject and offer them as one-click links.
- "Create flashcards from notes" / "Generate quiz" buttons reuse existing edge functions (`generate-flashcards`, `generate-quiz`) with the topic name pre-filled.

**3. Topic actions menu**
- Link existing note / flashcard set / quiz (multi-select Combobox).
- "Add as todo" → inserts `study_goals` row with `kind='todo'`, `academic_subject=exam.subject`, then writes a link row.
- "Add as goal" → inserts `study_goals` row with `kind='goal'`, `end_date=exam.exam_date`.
- Quick status toggle (not_started → learning → reviewing → confident).

**4. Readiness % (computed, not stored)**
- Per topic: status_weight (0/33/66/100).
- Per exam: weighted average of topic statuses × topic.weight.
- Bonus signal: if topic has ≥1 linked completed quiz and ≥1 linked flashcard set studied in last 7 days, nudge readiness display.

**5. "Generate study plan from exam"**
- Button on exam detail → opens existing `CreateStudyPlanForm` pre-filled with: subject, `end_date=exam_date`, `topics` jsonb from `exam_topics`. Stores resulting `study_plan_id` back on `exams.study_plan_id`.

**6. Dashboard widget**
- `<UpcomingExamsWidget />` queries next 3 exams ordered by `exam_date`. Shows readiness ring + days-left. Click → exam detail.

**7. Schedule / calendar**
- No code change needed in `ScheduleCalendar` — exam events render automatically once `event_type='exam'` is added to `getEventColor` / icon map in `event-utils.ts`.

**8. Onboarding / Settings**
- No changes. Subjects flow already covers it. Add a passive helper text in Exam Prep empty-state: "Subjects come from Settings → Subjects."

---

### UI surface

- **Page:** `/exam-prep` (`ExamPrepPage`) — list/grid of exam cards, "Add exam" button.
- **Page:** `/exam-prep/:id` (`ExamDetailPage`) — header with countdown + readiness ring, topics list, linked resources panel, "Create study plan" / "Add reminders" actions.
- **Components:** `ExamCard`, `ExamFormDialog`, `TopicRow`, `TopicStatusPill`, `ResourceLinkPicker`, `ReadinessRing`, `UpcomingExamsWidget`.
- **Hooks:** `useExams`, `useExam`, `useExamTopics`, `useExamTopicLinks`, `useExamReadiness` (react-query, mirrors `useSimplifiedGoals`).
- **Routes:** added in `src/routes/standardRoutes.tsx`.
- **Sidebar:** flag in `useNavigationFeatures` + entry under "Planning".

---

### Out of scope (this pass)
- AI-suggested topic lists from `curriculum_topics` (can plug in later — the table already exists).
- Spaced-repetition exam-aware scheduling.
- Sharing exams across users / study groups.
- Exam-specific analytics page (existing study analytics already covers per-subject time).

### Risks
- **Don't fork goal/todo logic.** The link table references `study_goals`; never duplicate that data.
- **Subject rename safety.** Store `subject_id` (FK with `on delete set null`) and resolve `name` at read time; fall back to a stored display name only on the calendar event.
- **Cascade discipline.** Deleting an exam cascades topics + links, but never deletes the linked notes/sets/quizzes/goals themselves.

## Two small fixes + an honest opinion

### 1. Sidebar rename (1-line job)

Change `Goals & Tasks` → `Study Goals` in:
- `src/components/ui/sidebar/Navigation.tsx` (the actual sidebar entry)
- `src/components/dashboard/GoalsSection.tsx` ("View All Goals & Tasks" button)
- `src/components/schedule/ScheduleCalendar.tsx` (toast message)
- `src/components/dashboard/progressive/AdvancedDashboard.tsx` (code comment)
- `src/components/settings/cards/email-digest/ContentTypesSection.tsx` (digest group label)

This keeps the whole app aligned with the page title "Study Goals" — no half-rename.

### 2. Fix Suggested Goals — base them on real content

**The bug you spotted is real.** I checked the database. The current logic reads from `user_subjects`, which gets pre-seeded at onboarding with Biology, Chemistry, Physics, Mathematics, History, English Lit, etc. — regardless of what the user has actually created. That's why you see "Master Biology Fundamentals" when you have zero biology content.

**New logic** (replaces `useGoalSuggestions`):

Pull the *real* subjects the user is actively working on by aggregating across:
- `notes.subject` (where `user_id = me`)
- `flashcard_sets.subject` (where `user_id = me`)
- `quizzes` joined to `user_subjects` via `user_subject_id` → `user_subjects.name` (quizzes don't have a direct `subject` column)

Count occurrences per subject, sort by frequency, take top 3, ignore the system "Imports" / "Scanned Documents" buckets.

Then suggest something *grounded* in the actual content:

```text
You have 12 notes and 3 flashcard sets in Biology.
→ "Review Biology — 5h over 7 days"

You have 4 notes in Physics but no flashcards.
→ "Turn Physics notes into flashcards — 3h over 5 days"

You took 2 quizzes in History and scored under 70%.
→ "Brush up History weak topics — 4h over 7 days"  (only if quiz_attempts data is available)
```

If the user has **no content yet**, show a single empty-state card: "Create your first note, quiz, or flashcard set — we'll suggest goals from there." Not three made-up subject goals.

### 3. Is this overdoing it? My honest take

**No, this one is worth doing** — but keep the scope tight.

The original suggestions are actively misleading. A student sees "Master Biology Fundamentals" and either (a) creates a goal they have no material to work on, then feels behind, or (b) loses trust in the suggestions and ignores the panel forever. Both outcomes are worse than no suggestions.

Where it *would* be overdoing it: building a recommendation engine with quiz-score weighting, spaced-repetition timing, predicted completion dates, etc. Don't go there yet. The simple "what subjects does the user actually have content in?" rule covers 90% of the value with 10% of the complexity.

**Scope I propose for v1:**
- Rank subjects by combined `notes + flashcard_sets + quizzes` count for that user.
- 3 templates max, each tied to a real subject the user has content in.
- Skip quiz-score logic for now (nice-to-have, separate iteration).
- Empty-state card when there's no content.

### 4. Theme compliance

The current `GoalSuggestions.tsx` uses raw Tailwind colors (`bg-purple-50`, `border-purple-200`, `text-gray-800`, `bg-gradient-to-r from-gray-50 to-gray-100`). That violates the design system rule (semantic tokens only). I'll swap them to:
- Card surface: `bg-card border-border`
- Subtle accent surface: `bg-mint-50/50` (mint is already in the project palette and used in the page header)
- Text: `text-foreground` / `text-muted-foreground`
- Buttons: default `Button` variants (no hand-rolled colors)

Same pass over `OverdueGoalsSection`, `BulkOverdueActions`, and the now-removed stat cards' descendants if any leftover hardcoded colors remain. Goal: zero raw color classes in the goals/ folder.

### Files I'll touch

- `src/components/ui/sidebar/Navigation.tsx` — rename
- `src/components/dashboard/GoalsSection.tsx` — rename
- `src/components/schedule/ScheduleCalendar.tsx` — rename in toast
- `src/components/dashboard/progressive/AdvancedDashboard.tsx` — rename in comment
- `src/components/settings/cards/email-digest/ContentTypesSection.tsx` — rename group label
- `src/hooks/useStudyGoals/goalSuggestions.ts` — rewrite to use real content
- `src/components/goals/GoalSuggestions.tsx` — replace hardcoded colors with semantic tokens, update copy for empty state

No DB changes, no new tables, no new API calls beyond what already exists.

Approve and I'll switch to build mode.

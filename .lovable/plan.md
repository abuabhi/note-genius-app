## Goals Page — Honest Audit

### What's actually on the page today

Header → 4 stat cards → AI Suggestions panel → 5 tabs (All / Due Soon / By Progress / Recent / Analytics) → Search + Status filter → Goals grid → Create dialog.

Supporting machinery behind it: `useStudyGoals`, `useGoalTracking` (auto-progress), `useGoalSuggestions` (AI templates), overdue handling (`OverdueGoalsSection`, `BulkOverdueActions`, `OverdueGoalActionDialog`), `GoalNotifications`, `GoalAnalytics` (336 lines of charts). Total: ~2,000 lines across 11 components.

### Verdict: Yes, it's overboard for a student

A student opening this page sees 4 stat cards, an AI suggestion panel, 5 tabs, search + filter, and a grid — before they've created a single goal. Most students just want to answer: *"What am I working on, and am I on track?"* The current page answers that question with a dashboard.

Specific friction points:

1. **5 tabs is too many.** "By Progress", "Recent", and "Due Soon" are all just sort orders — they belong in a single sort dropdown, not as top-level tabs.
2. **Analytics as a tab inside Goals is misplaced.** Charts of goal completion trends belong in the existing Progress/Analytics page, not buried here.
3. **4 stat cards are noisy.** Total / Completed / Active / Streak — Total and Active overlap conceptually. A single line ("3 active · 2 due soon · 1 overdue") communicates the same thing.
4. **AI suggestions panel competes with the user's own goals** for attention at the top of the page. Better as a small "+ Suggest a goal" button or an empty-state prompt.
5. **GoalFormDialog asks for Subject + Target Hours + Start Date + End Date upfront.** Target Hours in particular is a power-user concept — many students don't think in hours, they think in "finish chapter 5 by Friday".
6. **Overdue handling is its own subsystem** (3 components, bulk actions, action dialog). Useful, but should appear contextually only when overdue goals exist — not as permanent UI.

### Naming: Study Goals vs Goals & Tasks

**Recommendation: keep "Study Goals."**

Reasons:
- There is no Tasks feature in the codebase. Calling it "Goals & Tasks" would promise something that doesn't exist.
- "Study Goals" is specific and on-brand for a student tool. "Goals" alone is generic SaaS-speak.
- The sidebar and navigation already use "Goals" / "Study Goals" consistently.

If you later add lightweight to-dos (e.g. "Read chapter 3"), that's a separate feature — a Tasks tab inside a goal, or a separate Today/To-do surface — not a rename.

### Recommended simplification (proposed, not yet implemented)

Keep the page focused on one job: **see your goals, create one, mark progress.**

```text
┌─ Study Goals ──────────────────── [+ New Goal] ┐
│  3 active · 2 due soon · 1 overdue             │
├────────────────────────────────────────────────┤
│  [ Active | Completed ]   Sort: Due date ▾ 🔍 │
│                                                │
│  ▸ Overdue banner (only if overdue > 0)        │
│                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Goal     │ │ Goal     │ │ Goal     │        │
│  └──────────┘ └──────────┘ └──────────┘        │
└────────────────────────────────────────────────┘
```

Concrete changes:
1. Replace 4 stat cards with a single inline summary line.
2. Collapse 5 tabs → 2 (Active / Completed) + a Sort dropdown (Due date / Progress / Recent).
3. Move Analytics tab → link to existing Analytics page (or remove if redundant).
4. Make AI Suggestions a collapsible secondary section below the grid, or surface only in empty state.
5. Simplify Create Goal form: Title + Due Date required; Description / Subject / Target Hours collapsed under "Add details" (optional).
6. Show Overdue section only when there are overdue goals (already partly the case — verify and enforce).
7. Keep the page title "Study Goals."

### Technical scope (if you approve)

- `src/pages/GoalsPage.tsx` — replace stats block, reduce tabs to 2, add sort dropdown, conditionally render overdue.
- `src/components/goals/GoalStats.tsx` — replace with compact inline summary component (or delete and inline).
- `src/components/goals/GoalFormDialog.tsx` — make Subject/Target Hours/Start Date optional under a disclosure.
- `src/components/goals/GoalSuggestions.tsx` — move below grid or render only when `goals.length === 0`.
- `GoalAnalytics` — remove from this page; keep file for reuse on Analytics page if desired.
- No DB schema changes. No data loss. No route changes.

### What I am NOT proposing
- Renaming the page.
- Removing AI suggestions, overdue handling, or auto-tracking — just relocating/conditionalising them.
- Touching the Schedule or Exam Prep integrations from the previous task.

Approve this and I'll switch to build mode and apply the simplification.

## Goal

A throwaway prototype at `/gantt` where you can pick an existing exam (e.g. Maths Methods, 1-Oct), have a task tree auto-seeded across the weeks before it, then drag, resize, and link dependencies on a Gantt chart. All state lives in `localStorage` so we can rip it out cleanly if you don't like it.

## What you'll see

```text
/gantt
┌─────────────────────────────────────────────────────────────────┐
│  Plan for: [Maths Methods — 1 Oct ▼]   [+ Auto-seed] [+ Task]   │
├──────────────────────────┬──────────────────────────────────────┤
│ TASKS (tree)             │  TIMELINE  (Day | Week | Month)      │
│ ▾ Calculus               │  ████████░░░░░░░░░░░░░░░  40%        │
│   • Limits               │     ███░░░                            │
│   • Derivatives          │        ████░░                         │
│   • Integrals            │            █████░ ─→ depends on Deriv │
│ ▾ Statistics             │  ░░░░░░████████░░░░░░░░░░  60%       │
│   • Distributions        │        ████░░                         │
│ ▸ Mock Exam (Sep 25)     │  ░░░░░░░░░░░░░░░░░░██████  0%        │
└──────────────────────────┴──────────────────────────────────────┘
```

Left = collapsible task/sub-task tree with % complete. Right = bars on a date axis. Drag to move, drag edges to resize, drag from one bar's right edge to another's left to create a dependency arrow. Inline edit task names. Toolbar to switch Day/Week/Month zoom.

## Auto-seed logic

When you pick an exam and hit **Auto-seed**:
1. Read existing `exam_topics` for that exam (we already have the table). If none exist, generate a default tree: `Foundations → Core Topics → Practice → Mock Exam → Final Review`.
2. Spread tasks evenly between **today** and **exam_date − 3 days**.
3. Create one parent task per topic, with sub-tasks `Learn`, `Practice`, `Review`.
4. Add a `Mock Exam` milestone 1 week before, and `Final Review` in the last 3 days.
5. Default dependencies: each topic's `Practice` depends on its `Learn`, `Review` depends on `Practice`, `Mock Exam` depends on all `Review`s.

You can then drag/edit anything.

## Library choice

`gantt-task-react` (MIT, ~40KB, React-native, supports drag/resize/dependencies/progress/zoom out of the box). Alternatives considered: `frappe-gantt` (not React-native, awkward), `dhtmlx-gantt` (commercial for advanced features). `gantt-task-react` is the right fit for a prototype.

## Persistence

LocalStorage key per exam: `gantt:plan:<examId>` containing `{ tasks: GanttTask[], updatedAt: string }`. A separate `gantt:plan:standalone` for plans not linked to an exam. Auto-save on every change (debounced 400ms).

## Files to add

- `src/pages/GanttPage.tsx` — page shell, exam picker, toolbar, save indicator.
- `src/components/gantt/GanttBoard.tsx` — wraps `gantt-task-react`, handles change events.
- `src/components/gantt/TaskTreeSidebar.tsx` — collapsible left panel (we render our own tree above the library's built-in one for nicer UX, or use the library's if it suffices in v1).
- `src/components/gantt/ExamPickerBar.tsx` — dropdown of user's exams + "Standalone plan" option.
- `src/hooks/gantt/useGanttPlan.ts` — load/save/migrate localStorage, expose `tasks`, `setTasks`, `addTask`, `removeTask`, `seedFromExam`.
- `src/hooks/gantt/useAutoSeed.ts` — the seeding algorithm above; pulls exam + topics via existing `useExams` / `useExamTopics`.
- `src/types/gantt.ts` — `GanttTask`, `GanttDependency`, storage shape.

## Files to edit

- `src/routes/standardRoutes.tsx` — add lazy route `/gantt → GanttPage`.
- `package.json` — add `gantt-task-react` dependency.
- (Optional) `src/components/ui/sidebar/sections/PlanningNavigationSection.tsx` — add a temporary "Gantt (beta)" link so you can find it. Behind a simple flag so removing it later is one line.

## Out of scope (v1)

- No Supabase table, no calendar sync, no sharing, no print/export. All deferred until you decide to merge with `/schedule`.
- No mobile-optimised view. Desktop-first prototype (you're testing at 1460px anyway).
- No undo/redo (localStorage snapshot on every save means worst-case you re-seed).

## How we'd graduate it later (not now)

If you like it: create `study_plan_tasks` + `study_plan_dependencies` tables with RLS, swap the localStorage hook for a Supabase-backed one, optionally render bars as overlays on the FullCalendar `/schedule` view, and remove the `/gantt` route or keep it as the dedicated planning surface.

---

Approve and I'll build it.

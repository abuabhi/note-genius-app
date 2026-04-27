# Schedule: real data + Goals/Exams integration + theming

## What's wrong today

1. `ScheduleCalendar.tsx` ignores the real `events` query and renders a hard-coded `INITIAL_EVENTS` demo array (that's where "Study Session" on 28-Apr and "Quiz Review" on 30-Apr come from — `today + 1` and `today + 3`).
2. Clicking an event calls `clickInfo.event.remove()` — only an in-memory removal, never touches the DB.
3. Exam dates and goal dates never appear on the calendar.
4. FullCalendar uses its default CSS (dark slate buttons, blue pills) — does not follow the mint/HSL design tokens.

## Fix

### 1. Remove demo data
- Delete `INITIAL_EVENTS` and `getEventsForDateRange` from `src/components/schedule/event-utils.ts`. Keep only `createEventId` and `formatEventDate`.

### 2. Wire real data into `ScheduleCalendar.tsx`
Merge three sources into a single `EventInput[]` for FullCalendar:

- **Events** — from `useEvents(selectedDate).events` (already fetches `events` table for the visible month).
- **Exams** — from `useExams().exams`. Exams created with `createCalendarEvent` already insert an `events` row with `event_type='exam'`, so to avoid duplicates we only render exams whose `event_id` is null (standalone). Events with `event_type='exam'` get the exam color automatically.
- **Goals** — from `useSimplifiedGoals().goals`. Render two pills per goal: `Goal due: <title>` on `end_date`, and `Goal starts: <title>` on `start_date` (only if different from end_date).

Each event carries `extendedProps = { source: 'event'|'exam'|'goal-start'|'goal-end', recordId }` so click handlers know what to do.

### 3. Real deletion
`handleEventClick` uses `extendedProps.source`:
- `event` → `deleteEvent.mutateAsync(recordId)` from `useEvents`, then refetch.
- `exam` → `deleteExam(exam)` from `useExams` (which also cleans up the linked event row).
- `goal-*` → toast "Manage this goal from the Goals & Tasks page" (no in-place delete; goals are managed on their own page).

All deletions go through a `confirmDialog` first.

### 4. Theme FullCalendar to match the app
Add a scoped CSS block to `src/index.css` using the existing HSL tokens (`--primary`, `--border`, `--foreground`, `--muted-foreground`, `--accent`, `--destructive`, `--card`). Scope everything under `.schedule-calendar` so we don't affect other FullCalendar usages.

Tokens to override:
```
.schedule-calendar {
  --fc-border-color: hsl(var(--border));
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: hsl(var(--muted));
  --fc-today-bg-color: hsl(var(--accent) / 0.5);
  --fc-button-bg-color: hsl(var(--card));
  --fc-button-text-color: hsl(var(--foreground));
  --fc-button-border-color: hsl(var(--border));
  --fc-button-hover-bg-color: hsl(var(--accent));
  --fc-button-active-bg-color: hsl(var(--primary));
  --fc-button-active-border-color: hsl(var(--primary));
  --fc-event-bg-color: hsl(var(--primary));
  --fc-event-border-color: hsl(var(--primary));
  --fc-event-text-color: hsl(var(--primary-foreground));
}
```
Plus rounded buttons, themed toolbar title typography, soft hover states, and color variants for the three event kinds:
- `.fc-event-default` → primary (mint)
- `.fc-event-exam` → destructive (red)
- `.fc-event-goal` / `.fc-event-goal-start` → amber

Also wrap the calendar in `rounded-2xl border border-border bg-card p-4 shadow-sm` so the widget sits in the same card style as other surfaces, and add a small legend underneath (Events / Exams / Goals dots).

### 5. Misc cleanup in `ScheduleCalendar.tsx`
- Drop unused `weekendsVisible` toggle, `currentEvents` state, `renderEventContent`/`renderSidebarEvent`/`handleEvents`/`handleDatesSet` debug helpers.
- Set `editable={false}` (we no longer support drag-resize on items that aren't pure events).
- After successful event creation, call `refetchEvents()` + `refetchUpcomingEvents()` (currently it just `console.log`s).

## Files touched

- `src/components/schedule/event-utils.ts` — remove demo data
- `src/components/schedule/ScheduleCalendar.tsx` — full rewrite of data wiring + click handling
- `src/index.css` — scoped FullCalendar theme block under `.schedule-calendar`

No DB changes. No new dependencies.

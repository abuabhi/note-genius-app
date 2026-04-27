## What's wrong

After tracing the data flow on `/schedule`, two real bugs explain what you're seeing:

**Bug 1 — Calendar shows goals on the start date.**
`src/components/schedule/ScheduleCalendar.tsx` (lines 72–101) creates TWO calendar entries for every goal: a `Goal due: …` chip on `end_date` AND a `Goal starts: …` chip on `start_date`. That's why a goal appears on the day it begins instead of (or in addition to) the day it's due.

**Bug 2 — Goals never appear in "Upcoming Events (Next 7 Days)".**
`src/components/schedule/UpcomingEventsList.tsx` only renders items from the `events` array, and `useUpcomingEventsQuery` (`src/hooks/events/useEventQueries.ts`, lines 54–86) queries only the `events` table. Study goals live in the `study_goals` table and are never merged in, so a goal due in the next 7 days is invisible there.

The same `UpcomingEventsList` is used on this page exclusively, so the fix is localized.

## Fix

1. **Calendar — remove goal start markers.**
   In `ScheduleCalendar.tsx`, drop the `if (g.start_date && g.start_date !== g.end_date) { … goal-start … }` block so only the `Goal due: …` chip on `end_date` is rendered. Also remove the now-unused `'goal-start'` from the `SourceKind` union, the `goal-start` branch in `handleEventClick`, and the `.fc-event-goal-start` CSS rule in `src/index.css`.

2. **Upcoming Events — include goals due in the next 7 days.**
   - Add `useUpcomingGoalsQuery` in `src/hooks/events/useEventQueries.ts` that selects `id, title, description, end_date` from `study_goals` where `user_id = userId`, `status != 'completed'`, and `end_date` is between today and today+7.
   - Expose it through `useEvents` (`src/hooks/events/useEvents.ts`) and the `UseEventsReturn` type (`src/hooks/events/types.ts`) as `upcomingGoals`.
   - In `SchedulePage.tsx`, pass `upcomingGoals` into `UpcomingEventsList`.
   - In `UpcomingEventsList.tsx`, normalize each goal into the same day-grouped structure used for events (key by `end_date`), render with a distinct "Goal due" badge + blue accent (matching the existing `.fc-event-goal` color), and show days-remaining context (e.g. "Due in 3 days"). No time row for goals (they're all-day).
   - Invalidate the new query inside `useGoalActions` / `useSimplifiedGoals` mutations so creating, editing, or completing a goal refreshes the list immediately.

3. **Cache invalidation hooks.**
   Add `queryClient.invalidateQueries({ queryKey: ['upcomingGoals'] })` wherever goals are mutated (`useSimplifiedGoals.ts` create/update/delete paths and `useOverdueGoalManager.ts` reschedules) so the Upcoming list stays in sync.

## Files to change

- `src/components/schedule/ScheduleCalendar.tsx`
- `src/index.css` (remove `.fc-event-goal-start` rule)
- `src/hooks/events/useEventQueries.ts`
- `src/hooks/events/useEvents.ts`
- `src/hooks/events/types.ts`
- `src/components/schedule/UpcomingEventsList.tsx`
- `src/pages/SchedulePage.tsx`
- `src/hooks/useSimplifiedGoals.ts` (invalidate `upcomingGoals`)
- `src/hooks/useOverdueGoalManager.ts` (invalidate `upcomingGoals`)

No database migration required — `study_goals` already has `end_date` and `status`.

## Result

- Calendar: each goal shows up exactly once, on its due date, as "Goal due: …". No more start-date noise.
- Upcoming Events (Next 7 Days): goals due within the window appear grouped by their due date alongside events, with a clear "Goal due" badge.

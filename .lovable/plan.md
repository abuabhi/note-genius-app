## Subject field → dropdown of user's onboarding subjects

Quick, focused change. No DB work.

### What changes

In `GoalFormDialog.tsx`, replace the free-text Subject `<Input>` with a `<Select>` populated from `useUserSubjects()` (which already reads `user_subjects` — the table seeded during onboarding).

### Behavior

- Dropdown lists the user's subjects, alphabetically (already sorted by the hook).
- Pre-selects the existing value when editing a goal. If the saved subject no longer exists in `user_subjects`, it's still shown as a one-off option labelled `"<name> (removed)"` so editing doesn't silently drop it.
- Includes a "— None —" option, since Subject is optional in the simplified form.
- A small **"+ Manage subjects in Settings"** link appears at the bottom of the dropdown popover, navigating to `/settings` (the Subjects tab is already there as `value="subjects"`). Clicking it closes the dialog so the user lands on Settings cleanly.
- If the user has *zero* subjects in `user_subjects`, the dropdown shows a single disabled "No subjects yet" item plus the same Settings link.

### Loading / empty states

- While subjects load: dropdown shows a disabled "Loading…" trigger.
- Uses semantic tokens only — no raw color classes.

### Files touched

- `src/components/goals/GoalFormDialog.tsx` — only file changed.

No schema changes, no new hooks, no new routes.

Approve and I'll apply it.

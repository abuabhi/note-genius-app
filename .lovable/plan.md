# Fix Edit Study Goal + Clarify Reward Points

## Issues found

### 1. Edit Goal is broken
`GoalFormDialog` initializes `formData` with `useState(initialData)` — React only reads this **once** on first mount. Since the dialog component stays mounted across opens, when the user clicks **Edit** on any goal, the form keeps showing the previously seen values (or empty defaults), and the dialog title is hardcoded to "Create Study Goal" / button says "Create Goal" even in edit mode. Submitting may also send stale data, making it look like edit doesn't work.

### 2. Reward Points are unexplained
The `Reward Points` row appears on every goal card (and hits 0 pts at 0% progress) with zero context. New users have no idea:
- What points are for
- How they're earned (milestones / completion / early-finish bonus)
- Whether they can be redeemed (they currently can't — purely motivational)

## Fix plan

### A. Make Edit actually work (`GoalFormDialog.tsx`)
- Sync internal `formData` whenever `initialData` or `open` changes (via `useEffect`), so opening Edit on a different goal loads its values, and opening Create resets to defaults.
- Detect edit mode via presence of `initialData.title` (or new `mode` prop passed from `GoalsPage`).
- Update header/button copy dynamically:
  - Title: `Edit Study Goal` vs `Create Study Goal`
  - Submit button: `Save Changes` / `Saving...` vs `Create Goal` / `Creating...`
- Auto-expand the "details" section in edit mode so users can see/change subject, hours, start date.

### B. Clarify Reward Points (`GoalCard.tsx`)
- Add a small `info` icon (`lucide-react` `Info`) next to "Reward Points" with a `Tooltip` / `Popover` that explains:
  > Earn points as you hit milestones (25/50/75%) and bonus points for completing early. Points celebrate your consistency — they're motivational badges, no redemption needed.
- Show a one-time dismissible hint banner above the first goal card for new users (stored in `localStorage` key `goals.rewardPointsHintDismissed`) explaining the system briefly with a "Got it" button.
- Hide the row entirely when `target_hours` is 0 or points = 0 AND goal is brand-new (progress = 0, just created), so first-time users aren't confronted with "0 pts" with no context. Alternative: keep visible but show "Earn points by making progress" instead of "0 pts".

## Files to edit

- `src/components/goals/GoalFormDialog.tsx` — sync state with `initialData`, dynamic title/button, auto-expand details in edit mode.
- `src/components/goals/GoalCard.tsx` — Info tooltip on Reward Points, friendlier zero-state copy.
- `src/pages/GoalsPage.tsx` — render a dismissible "How Reward Points work" hint above the goals grid for first-time users (localStorage-gated).

## Out of scope
- No DB schema change; reward points remain a computed display value.
- No actual redemption system (would be a separate feature).


## What's left from the approved cleanup

Two items were explicitly deferred in the last pass:

### 1. Merge Todos into Goals (one task abstraction)
Today there are two overlapping concepts: `todos` (flat task list) and `goals` (objectives, often with sub-tasks). Students see both in the sidebar (now grouped as "Goals & Tasks") but the data models are still separate, which means duplicate UI, duplicate hooks, and confusion about "where do I put this?".

**Plan:**
- Treat `goals` as the parent abstraction. A todo becomes a goal with `type = 'task'` (no target date / no milestones required).
- Add a `kind` column to `goals` (`'goal' | 'task'`) via migration; backfill existing rows as `'goal'`.
- Write a one-shot migration that copies `todos` rows into `goals` as `kind = 'task'`, preserving `completed`, `due_date`, `created_at`.
- Update `GoalsSection` on the dashboard to show both kinds with a simple filter chip (All / Goals / Tasks).
- Delete `TodosSection`, `useTodos`, `/todos` route (redirect → `/goals`), and the `todos` table after backfill is verified.

### 2. Mobile audit at 375px
Three flows that students actually live in: **Notes editor**, **Flashcard study**, **Quiz take**.

**Plan:**
- For each flow, screenshot at 375×812 and check: tap targets ≥44px, no horizontal scroll, sticky action bars don't cover content, modals fit, font sizes ≥14px for body.
- Fix issues inline (most likely candidates: flashcard flip controls, quiz answer buttons, notes toolbar overflow).
- No data-model changes — purely CSS / layout.

---

### Suggested order
**Do #2 first** (mobile audit) — it's lower risk, no migrations, and directly impacts retention since most students study on phones. Then tackle #1 (Todos → Goals merge) which needs a DB migration and careful backfill.

### Out of scope for this pass
- New features
- Performance/bundle work (already handled in the chunk-splitting pass)
- Admin surface changes

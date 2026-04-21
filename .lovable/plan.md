
## Audit: Reduce Overload + Scale to 100s of Concurrent Users

A pass across entry points, workflows, data fetching, and failure modes. Grouped by impact, with concrete mitigations. Pick the slices you want and I'll implement them.

---

### 1. Cognitive overload (UX)

**Findings**
- `IntermediateDashboard` stacks 6 large sections (Hero, OnboardingChecklist, StudySuggestions, LearningToolkit, Planner+Goals, QuickActions). New users land on this page after creating one note and immediately see ~8 CTAs.
- `EnhancedQuickActionsGrid` shows 3 cards that duplicate what's already in the sidebar.
- `NewUserDashboard` shows hero + checklist + quick start + welcome tips card with a static 4-step explainer — three onboarding surfaces competing.
- Sidebar still has 6 grouped sections; some links (Reminders, Study Planner, Schedule, Goals) overlap conceptually.
- Routes inventory: 70+ pages, several near-duplicates remain (`StudyPlannerPage` vs `SchedulePage`, `RemindersPage` vs `/goals`, `FlashcardLibraryPage` vs `FlashcardsPage`, `EditNotePage` vs in-place editor).

**Fixes**
- **Collapse dashboard to 3 zones**: (1) "Continue / Resume" hero, (2) "Today" (goals + reminders combined, max 5 items), (3) one `EnhancedQuickActionsGrid` row. Move analytics, learning toolkit, study suggestions behind tabs or a "More" section.
- **Single onboarding surface**: keep `OnboardingChecklist`, delete the static "Welcome Tips" card and `WelcomeBanner` (one or the other, not both).
- **Merge Reminders into Schedule**: `/reminders` → `/schedule?tab=reminders`. Drop `RemindersPage` from sidebar.
- **Merge `/study-planner` into `/schedule`** (same data, different views — make views tabs).
- **Empty-state-first dashboard cards**: every section that can be empty should render a single CTA, not a "no data" panel + a header + a footer.

---

### 2. Concurrency & scale (100s of users)

**Findings**
- `EnhancedQuickActionsGrid` runs 4 parallel `select('id')` queries on every dashboard mount just to compute badge counts. Per user, per render tree.
- Codebase has **635 `select('*')` calls across 84 files** — many on tables with growing rows (study_sessions, quiz_results, user_flashcard_progress). These will become expensive at scale.
- `useTodaysFocusData` keys on `allReminders.length` — re-runs whenever reminders mutate, fans out to other queries.
- React Query defaults are sane (`staleTime: 5min`, no refetchOnWindowFocus). Good.
- No client-side request batching for dashboard widgets — every widget = its own round-trip.
- Edge functions `note-chat`, `enrich-note`, `generate-flashcards`, `generate-quiz` are AI calls with no client-side queueing or abort surfaced to users — the existing `useConcurrencyManager` is not used in those flows.

**Fixes**
- **Counts via RPC**: replace the 4 separate count queries in `EnhancedQuickActionsGrid` with one `dashboard_counts(user_id)` Postgres function returning `{notes, flashcard_sets, quizzes, active_goals}`. 4 round-trips → 1.
- **Replace `select('*')`** on the top 10 hottest hooks (`useUnifiedAnalytics`, `useRecentActivity`, `useProgressAnalytics`, `useEnhancedStudySuggestions`, `useSimplifiedFlashcards`) with explicit column lists and `limit()`. Most analytics queries pull entire tables today.
- **Add `range()` / pagination defaults** to anything that lists user-scoped rows (notes, flashcards, quiz history) — Supabase caps at 1000 silently.
- **Wire `useConcurrencyManager`** into AI-invoking actions (note-chat send, generate-flashcards, generate-quiz) so a user spamming "Enrich" doesn't open 5 parallel edge function calls.
- **Database indexes**: confirm composite indexes on `(user_id, created_at DESC)` for `notes`, `study_sessions`, `quiz_results`, `study_goals`, `reminders`. I'll list missing ones via `supabase--linter` before migrating.
- **Edge function cold-start mitigation**: keep `health-check` cron warm (already exists) and add `note-chat` + `generate-flashcards` to the warm list.

---

### 3. Failure points & mitigations

| Failure | Today | Mitigation |
|---|---|---|
| AI edge function timeout (45s+) | Generic toast, no retry | Stream responses where possible (`note-chat-streaming` exists — use it everywhere); show partial progress; offer "retry" button |
| User loses unsaved note edit | Local state only | Add localStorage autosave keyed on `noteId` every 5s using `useManagedInterval` |
| Quiz submit fails mid-attempt | Attempt lost | Persist answers to `quiz_attempts_draft` after each answer, resume on reload |
| Stripe webhook race during signup | Tier may not apply | Already handled via `check-subscription` — verify it runs on first dashboard load if `tier='free'` |
| 1000-row Supabase cap hit silently | Missing data | Audit all `.select()` without `range()` or `limit()`; add explicit `.limit(100)` defaults |
| Anonymous abuse of public AI endpoints | Cost spike | Document edge functions all have `verify_jwt = true` (check `config.toml`); flag any with `verify_jwt = false` |
| RLS misconfiguration | Data leak | Run `supabase--linter` and `security--run_security_scan` as part of this pass |

---

### 4. Trust & feedback

- **"Report bad AI output"** on quiz generation, note enrichment, AI chat — minimal: a button that writes to a `feedback` row with `kind='ai_quality'`, the prompt, and the response. Closes the loop and gives you training signal.
- **Surface "AI generated" badges** on flashcards/quizzes created by AI so students don't trust them blindly.

---

### 5. Entry-point clarity

**Today**: Dashboard → 8 things to do. Sidebar → 20+ links. Quick Actions → 3 cards.

**Proposed primary path for new users**:
1. Land on dashboard → see one big card: **"Upload PDF or paste notes → I'll make flashcards & a quiz"**.
2. Result page: created note, flashcard set, quiz — all linked together with "Study now" CTAs.
3. Everything else (Goals, Schedule, Analytics) appears in sidebar but is not pushed in onboarding.

This is the single workflow that proves PrepGenie's value in <2 minutes. Currently it's buried.

---

### Suggested order (risk-ranked)

1. **Dashboard counts RPC + remove duplicate sections** — pure win, no risk.
2. **Replace top-10 `select('*')` hotspots + add `.limit()`** — invisible to users, big perf win.
3. **Quiz attempt draft autosave** — prevents most-painful data-loss.
4. **Note editor autosave** — same.
5. **AI report-bad-output buttons** — small UI, big trust gain.
6. **Merge Reminders/Study Planner into Schedule** — touches routing + sidebar + 1 redirect each.
7. **Wire `useConcurrencyManager` into AI actions** — guards against spam.
8. **Run security scan + linter, fix findings**.
9. **New-user "PDF → flashcards" hero CTA** — needs design decision; do last.

### Out of scope this round
- New AI features
- Changing the AI provider or model
- Backend rate limiting (no infra primitives yet)
- Admin surface

Reply with which slices to implement (e.g. "1, 2, 3, 5") or "all" and I'll execute in that order.

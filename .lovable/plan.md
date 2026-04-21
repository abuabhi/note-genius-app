

## Expanded Page Load Speed Analysis

I'll extend the analysis to cover **every authenticated route**, not just the 6 in the previous plan.

### Full route coverage

**Public (no login)**
- `/` landing
- `/auth` login
- `/help` (newly rewritten)
- `/faq`, `/contact`, `/blog`, `/blog/:slug`

**Study surface**
- `/dashboard`
- `/notes` · `/notes/study/:noteId`
- `/flashcards` · `/flashcards/create` · `/flashcards/:id` · `/flashcards/study/:id`
- `/quiz` (list) · `/quiz/create` · `/quiz/:id` · `/quiz/:id/take`
- `/note-to-flashcard`

**Plan surface**
- `/schedule`
- `/goals`

**Insight surface**
- `/analytics`
- `/resources`

**Account surface**
- `/settings`
- `/feedback`
- `/referrals`
- `/influencer` (if accessible)

### Per-route deliverable

For each route, one row in a single master table:

| Route | LCP | FCP | CLS | INP | JS transferred | Long tasks | Verdict |
|---|---|---|---|---|---|---|---|

Verdict: ✅ ship · ⚠️ optimize · 🔴 must fix (thresholds same as previous plan: LCP <2.5s good, <4s acceptable; initial JS <300KB good, <600KB acceptable).

### Method
1. `navigate_to_sandbox` per route on the **published** build (`prepgenie.lovable.app`) — production bundle, not Vite dev.
2. `performance_profile` + `list_network_requests` after each load.
3. For any route flagged ⚠️ or 🔴: `start_profiling` → reload → `stop_profiling` to get the top blocking functions.
4. Note any route that requires data fetching (quiz list, flashcard study) — measure both first-load and warm-cache.

### Auth requirement
Most routes require login. The browser shares your preview Supabase session, so I need you to **be logged in to the preview before I start**. If a route 401s, I'll skip it and list it for a logged-in re-run.

### Likely hot spots I'll specifically check
- **`/quiz/:id/take`** — heaviest interactive surface, autosave + timer
- **`/flashcards/study/:id`** — animation + spaced repetition state
- **`/analytics`** — chart libraries are usually the largest non-route bundle
- **`/notes/study/:noteId`** — rich editor + AI chat panel
- **`/schedule`** — calendar libraries

If any of these ship a >300KB chunk, I'll flag it for code-splitting in the optimization pass.

### Output
Single message containing:
1. Master table (all routes)
2. Top 5 prioritized optimizations (only if any route fails)
3. Overall production-readiness verdict

### Out of scope
- No code changes — analysis only.
- Optimizations get a separate plan once we see real numbers.
- No Lighthouse SEO/a11y audit.
- Admin routes skipped unless you have DEAN tier.


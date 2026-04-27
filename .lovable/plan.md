# Make all main pages open instantly

Goal: Notes, Flashcards, Quiz, Schedule, Goals, Exam, Analytics, Resources, Refer, Feedback, Help should open instantly on revisit (and faster on first visit) in production.

Note: Most of the lag in the Lovable preview is from Vite compiling chunks on first visit — that part disappears in production. The changes below target the lag that **will** still happen in production: provider remounts, blocking data fetches, and cold JS chunks.

## What we'll change

### 1. Hoist heavy data providers to the app root
Today `FlashcardProvider` lives inside `FlashcardsPage`, so every visit unmounts it and re-fetches sets from Supabase. Same pattern for `OptimizedNotesProvider` and a few others.

- Move `FlashcardProvider` and `OptimizedNotesProvider` into `ProtectedRoute` (or just above `AppRoutes` for authed users) so their cache survives navigation.
- Audit Quiz, Schedule, Goals, Exam pages for the same anti-pattern and hoist any per-page providers that fetch on mount.

### 2. Use React Query for top-level page fetches with proper staleTime
For pages that fetch directly (Quiz, Schedule, Goals, Exam, Analytics, Resources, Notifications):
- Wrap the initial list fetch in `useQuery` with `staleTime: 2 * 60 * 1000` and a stable `queryKey` per user.
- Revisits within 2 min render instantly from cache; background refetch updates the data.
- Global `QueryProvider` defaults are already good (5 min staleTime) — we just need to actually use `useQuery` instead of `useEffect + setState`.

### 3. Don't gate the page shell on data
Right now several pages render a full-screen skeleton until data arrives. We'll:
- Render the page shell (header, filters, sidebar, breadcrumbs) immediately.
- Only the content area shows a small skeleton while loading.
- This makes the perceived load time near-zero even on first visit.

### 4. Prefetch route chunks on sidebar hover
In the sidebar nav links:
- On `onMouseEnter` / `onFocus`, call the same dynamic `import()` used by the lazy route.
- By the time the user clicks, the chunk is already downloaded and parsed.
- Applies to all main nav items (Notes, Flashcards, Quiz, Schedule, Goals, Exam, Analytics, Resources, Refer, Feedback, Help).

### 5. Quick wins while we're in there
- Make sure `refetchOnMount: false` for these list queries (so cached data shows instantly).
- Remove any `await`-on-mount that blocks first paint (defer to `useEffect` with the shell already rendered).

## Files likely touched
- `src/components/app/AppRoutes.tsx` — wrap authed routes with hoisted providers
- `src/pages/FlashcardsPage.tsx` — remove inner `FlashcardProvider`
- `src/pages/NotesPage.tsx` — remove inner `OptimizedNotesProvider`
- Sidebar component (likely `src/components/layout/...`) — add hover prefetch
- Quiz / Schedule / Goals / Exam / Analytics / Resources / Feedback page entry files — switch initial fetch to `useQuery` and split shell from content skeleton

## Will this affect production?
- Vite-compile lag: **preview only**, not production.
- Provider remount + refetch lag: **happens in production today**, fixed by #1 + #2.
- Cold chunk download lag: **happens in production today on first visit**, mitigated by #4.
- Blocking skeletons: **happens in production today**, fixed by #3.

After this, revisits should be instant and first visits should show the page shell immediately with a small loading area inside.

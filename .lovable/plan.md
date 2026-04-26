## Problem

`/onboarding` shows two headers and two footers because `OnboardingPage` is wrapped twice:

1. `AppRoutes` puts `miscRoutes` inside `ProtectedRoute` → `SidebarLayout`, which renders its own header (PrepGenie + bell + user) and `Footer`.
2. `OnboardingPage` then also wraps its content in `<Layout>`, which renders `NavBar` + `Footer`.

Result: SidebarLayout header + NavBar header (two headers), and two footers stacked at the bottom (visible in screenshot 2).

## Audit of all pages

I traced every page that imports `<Layout>` against how its route is wired in `AppRoutes`:

| Page | Routed under | Uses `<Layout>` | Status |
|---|---|---|---|
| Public pages (Home, About, Pricing, Contact, FAQ, Features, Terms, Privacy, Login, Signup, TierSelection, Payment, SiteMap, HelpRedirect, AIFlashcards, StudyPlanner, QuizGenerator, StudyAnalytics) | publicRoutes (no wrapper) | Yes | Correct |
| NotFoundPage | miscRoutes `*` (special-cased: NOT wrapped in ProtectedRoute) | Yes | Correct |
| **OnboardingPage** | miscRoutes (wrapped in ProtectedRoute → SidebarLayout) | **Yes** | **DOUBLE — bug** |
| EditNotePage, FlashcardLibraryPage, QuizHistoryPage | Not imported by any route (dead files) | Yes | No user impact, but inconsistent |
| FeedbackPage | standardRoutes (SidebarLayout) | No | Correct |

So the only live double-render bug is `/onboarding`. The three dead-file pages still import `Layout` but are unreachable.

## Fix

### 1. Stop OnboardingPage from rendering its own Layout

`src/pages/OnboardingPage.tsx`: remove the `<Layout>` wrapper from both the loading branch and the main return. SidebarLayout (from `ProtectedRoute`) already provides the header and footer.

### 2. Clean up dead pages (optional but recommended)

Remove the `<Layout>` import and wrapper from `EditNotePage.tsx`, `FlashcardLibraryPage.tsx`, `QuizHistoryPage.tsx` so they're consistent with the SidebarLayout pattern in case they get re-wired later. Pure cleanup — no current routes touch them.

### 3. Verify after the change

Manually walk through `/onboarding` (auth required) — should show only one header (the SidebarLayout one with sidebar trigger + bell + user) and one footer.

## Why this won't regress other routes

- Public pages stay untouched — they correctly use `<Layout>` because their routes have no SidebarLayout wrapper.
- `NotFoundPage` stays untouched — the `*` route is explicitly special-cased in `AppRoutes` to skip `ProtectedRoute`, so it needs its own `<Layout>`.
- All standard/admin routes already render bare content inside `SidebarLayout` — no change needed.

## Files changed

- `src/pages/OnboardingPage.tsx` — remove `<Layout>` wrapper (the actual fix)
- `src/pages/EditNotePage.tsx` — remove unused `<Layout>` wrapper (cleanup)
- `src/pages/FlashcardLibraryPage.tsx` — remove unused `<Layout>` wrapper (cleanup)
- `src/pages/QuizHistoryPage.tsx` — remove unused `<Layout>` wrapper (cleanup)
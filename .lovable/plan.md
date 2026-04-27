# Add breadcrumb to flashcard study page

Currently `/flashcards/study/[id]` has no in-page way to return to the flashcards list — users must use the sidebar. Add a standard breadcrumb (`Flashcards / [Set name]`) at the top of the page so navigating back is one click.

## What changes

- **`src/pages/study/SimplifiedStudyPage.tsx`** — add a `Breadcrumb` block at the top of the main rendered view (above the page title), and also at the top of the loading and error states so the back path is always available.

## Breadcrumb content

- `Flashcards` → links to `/flashcards`
- Current page → set name when loaded, otherwise `Study Session`

## Technical details

- Use the existing shadcn `Breadcrumb` primitives from `@/components/ui/breadcrumb` (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbSeparator`, `BreadcrumbPage`).
- Use `react-router-dom`'s `Link` via `BreadcrumbLink asChild` so navigation stays SPA (no full reload).
- Render the breadcrumb in three places inside `SimplifiedStudyPage`:
  1. Above the loading skeleton
  2. Above the error alert (replacing the now-redundant inline "Back to Flashcards" button is optional — can keep both for clarity)
  3. Above the main `<h1>{setName}</h1>` block in the success state
- No changes needed in `StudyPageHeader.tsx` (it already defines breadcrumbs but isn't used by `SimplifiedStudyPage`); leave it alone to avoid unrelated regressions.
- No styling changes beyond a `mb-4` spacing utility under the breadcrumb.

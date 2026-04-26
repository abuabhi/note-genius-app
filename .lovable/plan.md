## Problem

Clicking the dashboard "Upload PDF" CTA navigates to `/notes?action=upload`, but `NotesPage` never reads the `action` query parameter. The user lands on the Notes list and has to click "Import" manually. The ~10 second delay you observed is the lazy-loaded NotesPage + notes data fetching; the dialog should open as soon as the page is ready.

## Fix

In `src/pages/NotesPage.tsx`:

1. Read the `action` query param using `useSearchParams` from `react-router-dom`.
2. When `action=upload` (or `action=import`), set `isImportDialogOpen` to `true` on mount.
3. Clean the param from the URL after opening so refreshing/closing doesn't re-trigger it.

The `EnhancedImportDialog` already defaults to the **File** tab (PDF/document upload), so opening the dialog drops the user directly in the right place — no extra tab routing needed.

## Optional follow-up (perf)

The 10s delay before the page becomes interactive is mostly: lazy chunk load + `useNotes` initial fetch. Out of scope for this fix, but if you want, we can:
- Preload the NotesPage chunk on hover of the dashboard CTA, and
- Show the import dialog above a skeleton so users can start uploading before notes finish loading.

## Files changed

- `src/pages/NotesPage.tsx` — read `?action=upload`, auto-open import dialog, strip the param.

## Diagnosis

The previous fix in `NotesPage.tsx` reads `?action=upload` and calls `setIsImportDialogOpen(true)`, but in your screenshot the dialog never appeared. The most likely cause: the auto-open effect runs once during page mount, but a React 18 StrictMode double-render or a state reset triggered by the `useNotes` hook completing its initial fetch swallows the open. We also strip the URL param immediately, so any later remount has nothing to react to.

## Fix

Harden the auto-open in `src/pages/NotesPage.tsx`:

1. Use a `useRef` flag to ensure the auto-open effect only fires **once per page visit**, regardless of re-renders.
2. Defer `setIsImportDialogOpen(true)` to the next tick (`setTimeout(..., 0)`) so the dialog is opened after the initial page render settles — avoids being clobbered by other mount-phase state changes.
3. Keep stripping `?action` from the URL (so refresh/close doesn't re-trigger), but only after the ref is flipped.

## Files changed

- `src/pages/NotesPage.tsx`

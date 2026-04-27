# Add "From Note" option to the New Flashcard page

## Why
On `/flashcards/:setId/create`, the user currently sees only **Manual Creation** and **CSV Import** tabs. There's a passive "Pro Tip" mentioning notes, but no actionable path. If the user already has notes, they should be able to turn them into flashcards directly from this page — that's a much better experience than copy-pasting manually.

## What changes

Add a third tab **"From Note"** (alongside Manual / CSV) inside `CreateFlashcard.tsx`. It will:

1. Show a searchable list of the user's existing notes (title + subject + short preview).
2. Let the user pick one note.
3. Send them into the existing conversion flow we already built, pre-targeted at the current `setId`, so generated cards land in **this** set (no new set is created).
4. Use the existing AI generator under the hood — which already prefers `enriched_content`, uses word-aware truncation, and the refined prompts from the previous round.

If the user has **zero notes**, the tab shows an empty state with a CTA to create a note.

## UX

```text
[ Manual Creation ] [ CSV Import ] [ From Note ]
                                    ─────────────
Search notes…  [____________________]

○ Biology — Cell Structure        2 days ago
○ Physics 101 — Newton's Laws     5 days ago
○ History — French Revolution     1 wk ago

[ Generate flashcards from selected note ]
```

Clicking the button runs the AI generator inline (same component used today on the dedicated `/note-to-flashcard` page) and inserts the resulting cards into the current set. A success toast and "X cards added" summary appear; user stays on the page and can keep adding more.

## Technical details

Files to modify:
- `src/components/flashcards/CreateFlashcard.tsx` — add a third `<TabsTrigger value="from-note">` and `<TabsContent>`. Switch the grid from `grid-cols-2` to `grid-cols-3`.

New file:
- `src/components/flashcards/CreateFlashcardFromNote.tsx` — small component that:
  - Loads the user's notes via the existing `useOptimizedNotes` (or a lightweight fetch hook already in the codebase).
  - Renders a search input + radio list.
  - On submit, calls the existing `AIFlashcardGenerator` inline with the selected note's content/enriched content, `flashcardSetId={setId}`, and the note's subject.
  - Triggers `onSuccess` so the parent page can navigate or refresh.

No backend, no DB, no new edge functions. Reuses:
- `AIFlashcardGenerator` (already prioritizes enriched content, calls `generateFlashcardsFromNotes`).
- The premium gate `usePremiumFeatures().aiFlashcardGenerationEnabled` — if disabled, show the upgrade nudge instead of the generator (same pattern as `NoteToFlashcard.tsx`).

Remove or shorten the standalone "Pro Tip" Alert at the top, since the action is now first-class in the tabs.

## Out of scope
- The `/flashcards/create` (new-set) page is not changed; users should pick/create a set first, then this option appears in the per-set create page.
- Bulk multi-note selection is already covered by `/note-to-flashcard`; we keep this single-note for simplicity here, with a "Convert multiple notes" link to `/note-to-flashcard` for power users.

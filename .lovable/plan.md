## Goal

In the **Create New Note** dialog, let users add a new subject without leaving the dialog, and provide a clear shortcut to fully manage subjects in Settings.

## What changes for the user

1. The Subject dropdown gets a new **"+ Add new subject…"** item at the bottom of the list.
2. Selecting it reveals a small inline input + "Add" button right under the dropdown. Typing a name and clicking Add (or pressing Enter):
   - creates the subject in the database,
   - refreshes the dropdown,
   - auto-selects the new subject,
   - shows a success toast.
3. A small helper line appears under the Subject field:
   _"Manage all your subjects in Settings → Subjects."_ The link opens `/settings?tab=subjects` in a new tab so the user doesn't lose what they typed.
4. Duplicate names (case-insensitive) are blocked with a friendly inline error.

## Files to change

- `src/components/notes/page/CreateNoteForm.tsx` — main edit. Add inline-add UI, wire to `addSubject` from the existing hook, add helper link.
- (No DB changes — `useUserSubjects` already exposes a working `addSubject` mutation against `user_subjects`.)

## Technical notes

- Use the existing `useUserSubjects()` hook — it already returns `{ subjects, addSubject, isLoading }` and invalidates the React Query cache on success, so the dropdown refreshes automatically.
- Add local state: `isAdding: boolean`, `newSubjectName: string`, `isSavingSubject: boolean`.
- Special sentinel value `"__add_new__"` in the `<Select>` triggers the inline input instead of selecting a subject.
- Validation: trim, min 1 char, max 60 chars, reject if a subject with the same name (case-insensitive) already exists in `userSubjects`.
- After successful add, set `selectedSubject` to the new name and collapse the inline input.
- Helper link: a plain `<a href="/settings?tab=subjects" target="_blank" rel="noopener">` styled with `text-mint-600 underline`. The Settings page already supports `?tab=subjects` via `useSearchParams`.
- Keep the existing red "Please select a subject" validation message; it disappears once the new subject is auto-selected.

## Out of scope

- Editing/deleting subjects inline (those stay in Settings → Subjects).
- Changes to other forms that pick a subject (Flashcards, Quiz, etc.) — can be done later if you want the same pattern there.

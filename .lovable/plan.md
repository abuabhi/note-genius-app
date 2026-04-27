## Goal

Make quiz-from-notes generation more transparent and reliable:
1. Show users which content source was used (enriched vs original) per note.
2. Guarantee the **entire note** is covered when generating questions (no silent truncation), without showing coverage UI.
3. Recommend a sensible question count based on note length, while letting users override.

---

## 1. Source badge (UI only)

In `src/components/quiz/note-to-quiz/NoteSelectionTab.tsx`, on each note card show a small badge:
- "Enriched" (mint) when `note.enriched_content` is non-empty.
- "Original" (gray) otherwise.

After generation, in `src/components/quiz/note-to-quiz/QuizReviewTab.tsx` show a single summary line:
- "Generated from N notes — X enriched, Y original".

Data already exists on `Note`; no schema change needed.

---

## 2. Full-note coverage (no UI)

Today the entire concatenated content is sent in one prompt. With long notes this risks the model focusing on early sections and ignoring the rest. Fix by **chunking + per-chunk question allocation**, all server-side and invisible to the user.

**Edge function `supabase/functions/generate-quiz/index.ts`:**

- After resolving content (enriched preferred), measure size in characters.
- If `content.length <= ~6000` chars → single call (current behavior).
- If larger → split into sequential chunks of ~5000 chars on paragraph boundaries (`\n\n`, then sentence fallback).
- Distribute `numberOfQuestions` proportionally across chunks by chunk length (minimum 1 per chunk; if chunks > requested questions, requested count is auto-bumped to `chunks` so every section gets at least one question — coverage guarantee).
- Run chunk calls **in parallel** (`Promise.all`) with the existing prompt, each told "generate K questions from this section".
- Merge, de-dupe by question text (existing logic), and return.
- Add a small system note in each chunk prompt: "This is section X of Y of a larger note — focus only on this section's content."

This guarantees every section contributes questions without exposing coverage warnings to the user.

**Client (`useNoteToQuizState.ts`):** no logic change beyond passing through the (possibly auto-bumped) returned question count for the success toast.

---

## 3. Recommended question count

Heuristic: **1 question per ~150 words**, clamped to `[3, 20]`.

- Compute total word count from the resolved (enriched-preferred) content of all selected notes in `useNoteToQuizState.ts` and expose `recommendedQuestions`.
- When the user changes selection, if they haven't manually overridden the count, auto-set `numberOfQuestions = recommendedQuestions`.
- Track a `userOverrode` flag set to `true` the first time the user changes the input; after that we stop auto-updating.
- In `NoteSelectionTab.tsx` (and `QuizGenerationControls.tsx`), show helper text under the input: `Recommended: N (based on note length)`. Add a small "Use recommended" link button shown only when current value ≠ recommended.
- Expand the dropdown in `QuizGenerationControls.tsx` to support up to 20, or replace with the existing numeric input for consistency.

---

## Technical Details

**Files to edit**
- `supabase/functions/generate-quiz/index.ts` — add chunking, parallel calls, auto-bump count, return `usedSource` summary `{ enriched: n, original: m }`.
- `src/components/quiz/note-to-quiz/useNoteToQuizState.ts` — compute `recommendedQuestions`, track `userOverrode`, pass per-note source map to edge function, store `usedSource` from response.
- `src/components/quiz/note-to-quiz/NoteSelectionTab.tsx` — per-note Enriched/Original badge, recommended-count helper + "Use recommended" button.
- `src/components/quiz/note-to-quiz/QuizGenerationControls.tsx` — same recommendation helper; allow values up to 20.
- `src/components/quiz/note-to-quiz/QuizReviewTab.tsx` — summary line showing source breakdown.

**Edge-function payload change**
Add `notes: Array<{ title, body, isEnriched }>` so the server can build per-note context and report `usedSource`. Keep backward-compatible with existing `content` string.

**No DB migration. No new dependencies.**

---

## Out of Scope
- Coverage warning UI (explicitly rejected).
- Changing difficulty controls or quiz review/save flow.

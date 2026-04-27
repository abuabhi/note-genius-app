## Goals

1. Make `/note-to-flashcard` open fast (currently waits for full notes list + flashcard sets before rendering).
2. Document the LLM + guardrails for flashcard generation.
3. **Add a coverage guarantee** so generated flashcards span the entire note, not just one section.

---

## Part 1 — Speed up `/note-to-flashcard`

### Root cause

`NoteToFlashcardPage` mounts `OptimizedNotesProvider` + `FlashcardProvider` and waits for the **entire paginated notes list** to load just to `find()` one note already identified by `noteId` in the URL.

### Fix

- Replace `useOptimizedNotes()` lookup with `useOptimizedNoteStudy(noteId)` (same hook the study page uses) — fetches just that one row, seeded from cache when available.
- Drop `OptimizedNotesProvider` when `noteId` is in the URL (the common case).
- Keep `FlashcardProvider` (BulkNoteConversion needs it for set selection) but render the page shell + skeleton independently of its loading state so it doesn't block first paint.

**File:** `src/pages/NoteToFlashcardPage.tsx`

Expected: interactive in ~150–300 ms warm (or instant from cache) instead of waiting for two list queries.

---

## Part 2 — LLM and current guardrails (informational)

**Model:** `google/gemini-3-flash-preview` via Lovable AI Gateway, called server-side from `supabase/functions/generate-flashcards/index.ts`. Model and prompt are never exposed to the client.

**Already in place:**
- System prompt enforces atomic cards, single clear question front, focused factual back, bans filler and duplicate questions.
- Subject (when known) injected into user prompt for domain bias.
- Forced **tool calling** with strict JSON schema (`emit_flashcards`) — no free-form prose, no parsing failures.
- Server-side `cleanCards`: drops empty/identical/duplicate cards, hard-truncates front to 120 chars and back to 300 chars, caps to requested count (1–20).
- Input validation: rejects content < 20 chars, clamps count.
- Single retry with stricter prompt if first call returns fewer valid cards than requested.
- Surfaces 429 (rate limit), 402 (credits exhausted), 422 (no valid cards) to the client with friendly messages.

**Not currently guarded:**
- Factual accuracy vs. source note.
- **Coverage across the full note** ← addressed in Part 3.
- Embedding-based dedup (current dedup is exact-string only).
- Tone consistency.

---

## Part 3 — Full-note coverage guarantee (new)

### Approach

Rather than feeding the whole note as a single blob and hoping the model spreads its attention, **explicitly chunk the note and require cards from each chunk**.

### Implementation in `supabase/functions/generate-flashcards/index.ts`

1. **Chunk the note** by structural boundaries (markdown headings `#`/`##`/`###`, then blank-line paragraphs). Cap chunk size to ~1,500 chars; merge tiny chunks; split oversized ones on sentence boundaries.
2. **Allocate cards per chunk** proportional to chunk length, with a **floor of 1 card per chunk** (when the user-requested `count` is ≥ number of chunks). If `count` < number of chunks, sample chunks evenly and label the result as `partial_coverage: true` so the UI can warn.
3. **Update the prompt** to pass labelled sections, e.g.:
    ```text
    SECTION 1/4: <heading or first line>
    <chunk text>
    ---
    SECTION 2/4: ...
    ```
   And instruct the model: "Produce N1 cards from SECTION 1, N2 from SECTION 2, …" Add the per-section counts to the tool schema as `section_index` on each card so we can verify.
4. **Tool schema update:** add `section_index: integer` to each card. Required so the model attributes each card to a section.
5. **Server-side coverage check** after `cleanCards`:
    - Count cards per `section_index`.
    - If any section has 0 cards (and was allocated ≥1), do a **targeted top-up call** for just that section (reusing existing retry path, but scoped to the missing section's text).
    - After top-up, drop `section_index` from the response payload (UI doesn't need it).
6. **Response additions:** include `coverage: { sections: N, sectionsCovered: M }` and `partial_coverage: boolean` in the JSON response. `aiService.ts` shows a toast when coverage is partial (e.g. "Note is long — only N of M sections covered. Increase card count for full coverage.").
7. **Long-note safety:** if total note length exceeds gateway-friendly size (~30k chars), truncate per-chunk inputs to top 1,500 chars and warn `truncated: true`.

### Files to change

- `supabase/functions/generate-flashcards/index.ts` — chunking, per-section allocation, prompt update, tool-schema `section_index`, coverage verification + targeted top-up, expanded response.
- `src/services/aiService.ts` — surface `coverage` / `partial_coverage` / `truncated` flags as toasts.
- `src/pages/NoteToFlashcardPage.tsx` — the speed fix from Part 1.

No DB changes. No new secrets. Default model unchanged.

### Behavior summary

- Short note (one section): same as today.
- Medium note (3 sections, count=6): 2 cards per section guaranteed.
- Long note (10 sections, count=5): even sampling across sections, response flagged `partial_coverage: true`, toast nudges user to raise the count.
- Very long note (>30k chars): per-chunk truncation, `truncated: true` toast.

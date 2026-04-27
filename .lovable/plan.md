## Scope confirmation

Yes — the same fixes apply to **all flashcard generation paths AND quiz generation**. Audit results:

| Entry point | Generator used today | Content used today | Issue |
|---|---|---|---|
| `/note-to-flashcard` "Smart Content Processor" (the one in your screenshot) | **Local templates** (`smartProcessContent`) — no AI | `note.content` only | Silly templated questions, mid-word truncation |
| "AI Flashcard Generator" button (`AIFlashcardGenerator.tsx`) | LLM (`generate-flashcards` edge fn) | `note.content` only | Ignores enriched content |
| Chat → "Generate flashcards" (`useFlashcardIntegration`) | LLM (`generate-flashcards`) | passed-in content (raw) | Ignores enriched content |
| `/note-to-quiz` (`NoteToQuiz` + `useNoteToQuizState`) | LLM (`generate-quiz` edge fn) | `note.content \|\| note.description` only | Ignores enriched content |

So the truncation fix is needed in **one place** (the template fallback), and the "prefer enriched content" fix is needed at **every caller** plus inside both edge functions as a safety net.

## Plan

### A. Replace the template-only path with the LLM (flashcards)

`src/components/notes/conversion/SmartContentProcessor.tsx`
- Replace `smartProcessContent(...)` with `generateFlashcardsFromNotes(content, desiredCardCount, subject)` from `@/services/aiService`.
- Map the LLM `{front, back}` into the existing preview shape, attaching the user-selected `FlashcardType`.
- Keep `smartProcessContent` only as a fallback when the AI call throws; show a toast: "AI unavailable — used basic generator."
- Add a small badge in the header showing "Using enriched note" or "Using original note".

### B. Prefer enriched content everywhere

Update every caller to pass `note.enriched_content || note.content`:
- `src/components/notes/conversion/BulkNoteConversion.tsx` (passes content into `SmartContentProcessor`)
- `src/components/notes/conversion/AIFlashcardGenerator.tsx`
- `src/components/notes/study/chat/hooks/useFlashcardIntegration.ts`
- `src/components/quiz/note-to-quiz/useNoteToQuizState.ts` (also for quiz)

Also, as a server-side safety net, accept an optional `useEnriched` flag plus an `enrichedContent` field in:
- `supabase/functions/generate-flashcards/index.ts`
- `supabase/functions/generate-quiz/index.ts`

If `enrichedContent` is provided and non-empty, prefer it over `noteContent`/`content`. This way we still benefit from enriched text even from older clients.

### C. Word-aware truncation everywhere

`src/components/notes/conversion/utils/contentProcessingUtils.ts`
- Replace every naive `string.substring(0, N) + '...'` with `truncateAtWord(text, N)` from `src/utils/textTruncation.ts`. Affects lines 65, 77, 126, 140, 153.
- Also rewrite the awkward template: `According to "<title>", what can you tell me about: <…>?` → `What are the key points about: <topic phrase>?` and `Explain: <topic phrase>` for variations.
- Same change applied to any quiz preview/truncation in `src/components/quiz/note-to-quiz/*` if present.

`src/components/study/components/FlashcardDisplay.tsx`
- Render is already CSS-based (no in-string truncation), so no change needed here. The fix lives at generation time, where the "…" is baked into the front text.

### D. Tighten LLM prompts so phrasing stays professional

In both edge functions, ensure the system prompt enforces:
- Self-contained questions (no phrases like "According to the text…").
- Concise, precise, exam-style wording.
- Concise back/answer with the key fact first, then optional one-line context.

`generate-flashcards/index.ts` already says *"No filler, no 'According to the text…'"* — extend the same rule to `generate-quiz/index.ts` and add: "Questions must read as professional exam prompts; never reference the source document; never insert ellipses inside questions."

## Files to change

- `src/components/notes/conversion/SmartContentProcessor.tsx` — switch to LLM, fallback only on error
- `src/components/notes/conversion/BulkNoteConversion.tsx` — prefer enriched content
- `src/components/notes/conversion/AIFlashcardGenerator.tsx` — prefer enriched content
- `src/components/notes/study/chat/hooks/useFlashcardIntegration.ts` — prefer enriched content
- `src/components/quiz/note-to-quiz/useNoteToQuizState.ts` — prefer enriched content
- `src/components/notes/conversion/utils/contentProcessingUtils.ts` — word-aware truncation + cleaner templates
- `supabase/functions/generate-flashcards/index.ts` — accept `enrichedContent`, tighten prompt
- `supabase/functions/generate-quiz/index.ts` — accept `enrichedContent`, tighten prompt

## Result

- The `/note-to-flashcard` page produces professional, LLM-generated cards (Gemini 3 Flash) instead of templated junk.
- Both flashcards and quizzes are grounded in **enriched content when available**, falling back to original content otherwise.
- No more mid-word "…" anywhere — the template fallback uses word-aware truncation, and the LLM prompts forbid the ellipsis-in-question pattern entirely.
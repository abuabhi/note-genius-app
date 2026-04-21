

## Audit: Flashcard & Quiz Quality + Card Layout

I checked the entire generation pipeline and how content renders. There are **three critical problems** today, plus several smaller ones. Most are fixable in one pass.

---

### Critical findings

#### 🔴 1. AI flashcard generation is a **stub** — it does nothing
`supabase/functions/generate-flashcards/index.ts` is 25 lines. It returns `{message: "Flashcards generation endpoint"}` and never calls any AI model. The client (`aiService.generateFlashcardsFromNotes`) expects `data.flashcards` and toasts "Invalid response" when it doesn't get one.

#### 🔴 2. `AIFlashcardGenerator` component is **fake**
`src/components/notes/conversion/AIFlashcardGenerator.tsx` calls `setTimeout(1500)` to fake a loading spinner, then inserts a single hardcoded card:
```
front: "AI Generated from: <note title>"
back:  <first 100 chars of note> + "..."
```
Then toasts "AI generated 1 flashcard" — misleading the user.

#### 🔴 3. `generateFlashcardsFromContent` (chat path) is also fake
`useFlashcardIntegration.ts:175` splits the note by newlines and creates cards with:
```
front: "What is the key point about: <50 chars>...?"
back:  <the same line>
```
Not AI. Not useful. Same question prefix on every card.

#### 🟡 4. `generate-explanation` edge function — also a stub (returns the same placeholder JSON).

#### 🟢 5. Quiz generation (`generate-quiz`) — **actually works**
Real OpenAI call, returns 4-option MCQs with explanations, validates structure (filters out malformed questions, ensures `correctAnswer` index is valid, slices to requested count). This is the only honest path in the pipeline.

---

### Card layout / overflow findings

| Surface | Today | Risk |
|---|---|---|
| `FlashcardDisplayCard` (study) | `min-h-[300px]`, no max-height, no scroll | Long AI back content overflows the card silently |
| `FlashcardWithProgress` | `max-h-[280px]` + `line-clamp-6` + `overflow-y-auto` | Good — clamps and scrolls |
| `FlashcardSetCard` (grid) | `line-clamp-2` on name + description | Good |
| `EnhancedFlashcardSetView` (preview) | `line-clamp-2` front, `line-clamp-3` back | Good |
| `QuizTakingCard` question | No clamp, no max-h | Long AI questions push options off-screen on mobile |
| `QuizTakingCard` option | No clamp, no max-h | A 200-char option breaks the radio row |
| `QuizCard` (grid) | `line-clamp-2` on title + description | Good |

So the **set/grid views** are safe; the **active study/quiz views** are not.

---

### What we don't validate today

- **No length caps** on `front_content`/`back_content` before insert — DB accepts anything
- **No content sanity checks** (empty, duplicate, "..." filler, identical front/back)
- **No client-side preview-and-edit step** before AI cards land in the set
- **No "report bad card"** even though we just added `ReportBadAIButton` for quiz/notes
- **Quiz prompt** doesn't constrain question/option length, so OpenAI sometimes returns 300-char options that break layout

---

## Plan

### Phase A — Fix the lies (must-do)

1. **Implement `generate-flashcards` for real** (Lovable AI Gateway, `google/gemini-3-flash-preview`):
   - Tool-calling for structured output (no JSON-in-text parsing)
   - System prompt: "You are an expert study coach. Create concise, atomic flashcards. Each front is a single clear question (≤120 chars). Each back is a focused answer (≤300 chars). No filler. No duplicates. No 'According to the text…'."
   - Returns `{flashcards: [{front, back}]}` validated server-side
   - Server-side trims to limits, drops empty/duplicate/identical-front-back cards, enforces requested `count`
   - Handles 429/402 from gateway and surfaces them to client

2. **Implement `generate-explanation` for real** (same gateway, smaller prompt). Returns `{explanation}`.

3. **Delete the fake paths**:
   - `AIFlashcardGenerator.tsx` → call `aiService.generateFlashcardsFromNotes` and bulk-insert real cards
   - `useFlashcardIntegration.generateFlashcardsFromContent` → route through `aiService` too

### Phase B — Server-side quality gates (in both edge functions)

In `generate-flashcards` and `generate-quiz`:
- **Length limits**: flashcard front ≤120, back ≤300; quiz question ≤200, each option ≤80, explanation ≤250
- **Drop bad rows**: empty, identical front/back, duplicate fronts within set, options that are substrings of the question, all-options-identical
- **Enforce count**: if AI returns fewer valid items than requested, retry once with a stricter prompt; if still short, return what we have with a `partial: true` flag the UI can show

Update `generate-quiz` prompt to add: "Keep each question under 200 chars and each option under 80 chars. Prefer 4 distinct, plausible options."

### Phase C — Client-side safety net

1. **Preview-and-edit modal before save** (flashcards): after AI returns N cards, show them in a list with editable front/back fields and per-card "Discard" + "Looks good". Only checked cards get inserted.
2. **Length validation in `createFlashcard`**: hard-cap at 500/1000 chars even if it slips past server.
3. **`ReportBadAIButton`** wired into:
   - Each card in `FlashcardDisplayCard`
   - Each question in `QuizTakingCard` (after answer reveal)

### Phase D — Layout fixes (overflow safety)

1. `FlashcardDisplayCard`: add `max-h-[60vh]`, inner `overflow-y-auto`, font auto-shrinks via `clamp(0.875rem, 2vw, 1.125rem)` for very long content.
2. `QuizTakingCard`:
   - Question: `max-h-[30vh] overflow-y-auto`
   - Each option: `max-h-[8rem] overflow-y-auto break-words`
   - Mobile: keep options in a single column (already is)

### Phase E — Observability (cheap, high-value)

- Log to a new `ai_generation_log` table: `{user_id, kind: 'flashcard'|'quiz'|'explanation', model, requested_count, returned_count, dropped_count, drop_reasons, latency_ms}`. One row per generation.
- Surface `dropped_count > 0` to the user as: "Generated 4 cards (1 was discarded as low quality)".

### Order of execution
A → B → D → C → E. A+B unblock everything; D is independent and can ship in parallel; C and E follow.

### Out of scope this round
- Difficulty calibration (per-user)
- Spaced-repetition tuning
- Image flashcards
- Multi-language prompts

---

### Technical notes (for me, when implementing)
- Use Lovable AI Gateway, not OpenAI directly (the existing key is `LOVABLE_API_KEY`; current `generate-quiz` uses `OPENAI_API_KEY` — leave it for now to avoid scope creep, but flag for migration).
- Reuse the existing `guardAIRequest` so spamming "Generate" doesn't fan out.
- Schema-validated tool-calling output (per Lovable AI gateway docs) avoids the regex-extract-JSON fallback in `generate-quiz`.
- New table `ai_generation_log`: RLS `user_id = auth.uid()` for select; insert via service role from edge functions.

**Reply "go" to execute Phase A+B+D in one pass, or pick specific phases.**


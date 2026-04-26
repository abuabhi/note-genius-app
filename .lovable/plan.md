## Problems found

After investigating the code, edge function logs, and screenshots, four distinct bugs are at play:

### 1. Top 10 Questions returns enriched-note content (root cause of "wrong content" + "Enriched and Questions look the same")
The `enrich-note` edge function (`supabase/functions/enrich-note/index.ts`) is called for **both** the Enriched Note tab (`enhancementType: 'enrich-note'`) and the Top 10 Questions tab (`enhancementType: 'generate-questions'`). But the function's `generateEnhancedContent()` uses **one generic system prompt** ("You are an assistant that enhances student notes…") regardless of `enhancementType`. So Questions just gets enriched-note output. That's why image 13 (Questions) shows "Class Overview / Units Breakdown" instead of Q1/A1, Q2/A2, etc.

The proper, type-specific prompts already exist in `supabase/functions/enrich-note/prompts.ts` (including a polished `generate-questions` prompt that produces `## Q1: …` / `**A1:** …` through Q10/A10) — they are simply not wired into `index.ts`.

### 2. Enriched Note formatting looks broken
Image 14 shows the enriched note rendering as plain markdown text without the highlighted left-border AI-enhanced blocks. Two contributing factors:
- The current generic prompt does not emit `[AI_ENHANCED]…[/AI_ENHANCED]` wrappers, so `markdownConverter` never wraps anything in the `.ai-enhanced-simple` styled div.
- Once we switch to the real `enrich-note` prompt from `prompts.ts`, the AI_ENHANCED tags will be emitted and the existing CSS styling (left border + light background) will apply automatically.

### 3. Key Points / Enriched bullet indentation
In `src/components/notes/study/SimpleContentRenderer.css`, list items use:
```
padding-left: 1rem !important;
text-indent: -1rem !important;
```
This hanging-indent trick makes wrapped lines align with the bullet instead of the text after the bullet. Combined with `padding-left: 1.2rem` on the `<ul>`, the visual result is the misaligned wrap shown in the screenshots. Replacing this with standard `padding-left` on the `<ul>` and removing the `text-indent` hack on `<li>` gives clean indentation where wrapped lines align under the first character of the bullet text.

### 4. After generation, focus jumps back to "Original" tab
`SimpleEnhancementTabs.tsx` keeps `activeTab` in **local** `useState('original')`. After a generation completes, `useEnhancementManager` calls `onNoteUpdate?.()` → React Query refetches the note → the parent re-renders with a new `note` object. Because `SimpleEnhancementTabs` is wrapped in `React.memo`, normally state would persist, but the parent chain (`NoteStudyView` → `NoteStudyDisplay`) re-creates intermediate elements that cause the tabs subtree to remount in some cases, so the local state resets to `'original'`.

The parent already maintains an `activeContentType` in `useStudyViewState`, but it is **not passed down** to `SimpleEnhancementTabs`. Lifting the active tab into the parent (or persisting it via the existing `activeContentType` prop) makes it survive any remount.

## Plan

### A. Backend — fix the Top 10 Questions and Enriched Note content

`supabase/functions/enrich-note/index.ts`
- Import `createPrompt`, `getTokenLimit`, `getModel` from the existing `./prompts.ts`.
- In `generateEnhancedContent()`, build the request using:
  - `model = getModel(enhancementType)` (falls back gracefully)
  - `system` = a short instruction ("Return only the formatted output as instructed; no preamble.")
  - `user` = `createPrompt(enhancementType, noteTitle, noteContent)`
  - `max_tokens = getTokenLimit(enhancementType)`
- Keep the OpenAI fallback path but make it type-aware (e.g. for `generate-questions`, return a clearly-labelled placeholder rather than the generic enriched stub) so it is obvious if the API key is missing.
- No schema/DB changes.

This single change fixes:
- Top 10 Questions now returns a real Q1/A1 … Q10/A10 list.
- Enriched Note now emits `[AI_ENHANCED]` blocks, which the existing renderer styles with the left border + tinted background.

### B. Frontend — fix list indentation

`src/components/notes/study/SimpleContentRenderer.css`
- Update `.simple-content ul` / `ol` rules:
  - `padding-left: 1.5rem` (slightly more breathing room, standard hanging indent)
  - `list-style-position: outside`
- Update `.simple-content li` rule:
  - Remove `padding-left: 1rem` and `text-indent: -1rem`
  - Keep `margin-bottom: 0.4rem`, `line-height: 1.5`
- Result: bullets sit in the gutter; wrapped lines align under the first character of the bullet text (matches the look users expect from the screenshots).

### C. Frontend — keep the active tab after generation

`src/components/notes/study/SimpleEnhancementTabs.tsx`
- Accept optional `activeContentType` and `onActiveContentTypeChange` props.
- Use them as the controlled value when provided, falling back to local state otherwise.

`src/components/notes/study/viewer/NoteStudyDisplay.tsx`
- Forward `activeContentType` and `onActiveContentTypeChange` from its parent down to `SimpleEnhancementTabs`.

`src/components/notes/study/viewer/NoteStudyViewContent.tsx`
- Pass the existing `activeContentType` / `onActiveContentTypeChange` into `NoteStudyDisplay` (they are already in the parent's state).

This way the selected tab is owned by `useStudyViewState` and survives any remount triggered by `onNoteUpdate`.

### D. Verification (after implementation)

1. Deploy the updated `enrich-note` function and tail its logs.
2. From the running preview, click **Generate** on the Top 10 Questions tab — confirm the response begins with `# Top 10 Study Questions` and contains Q1…Q10.
3. Click **Generate** on the Enriched Note tab — confirm the response contains `[AI_ENHANCED]` blocks and that the rendered output shows the green left-border highlight on the new sections.
4. Confirm the active tab does **not** jump back to "Original" after either generation completes.
5. Visually confirm Key Points and Enriched bullets wrap correctly (wrapped lines indented under the text, not under the bullet).

## Files to change

- `supabase/functions/enrich-note/index.ts` — wire in `prompts.ts`, model + token limits per type
- `src/components/notes/study/SimpleContentRenderer.css` — fix list indentation
- `src/components/notes/study/SimpleEnhancementTabs.tsx` — accept controlled active tab props
- `src/components/notes/study/viewer/NoteStudyDisplay.tsx` — forward active-tab props
- `src/components/notes/study/viewer/NoteStudyViewContent.tsx` — pass active-tab props through

No DB migrations, no new dependencies, no breaking API changes.

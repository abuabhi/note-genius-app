## Problem

Two bugs in the Enriched Note tab on the note study page:

1. **Tab focus jumps to "Original"** after enriched content finishes generating, even though the user was on the Enriched tab.
2. **Clicking "Enriched Note" again shows empty green ENRICHED cards** (badge + bullet markers visible, but text is gone). The screenshot confirms the card shells render correctly but bodies are blank.

## Root Causes

### Bug 1 — Tab focus reset
In `NoteStudyView.tsx` the `note` prop is replaced with a fresh object after `onNoteUpdate` fires (React Query refetch). Although `activeContentType` lives in `useStudyViewState` and is preserved, the parent `NoteStudyPageContent` re-renders with a new `note` reference, and somewhere down the tree `SimpleEnhancementTabs` falls back to its `internalActiveTab` (initialized to `'original'`) because the `activeContentType` prop briefly becomes undefined during the transition.

Specifically in `SimpleEnhancementTabs.tsx`:
```ts
const [internalActiveTab, setInternalActiveTab] = useState(activeContentType ?? 'original');
const activeTab = activeContentType ?? internalActiveTab;
```
If `activeContentType` is ever momentarily undefined, the tab snaps back to whatever `internalActiveTab` was — and `internalActiveTab` is never synced when the prop changes.

### Bug 2 — Empty enriched cards on second visit
In `EnrichedContentRenderer.tsx` the renderer calls `markdownToHtml(seg.text)` then `sanitizeHTML(...)`. Two issues:

- `sanitizeHTML` is configured with `KEEP_CONTENT: false`. When markdownToHtml emits a stray placeholder token (`\u0000AIENH0\u0000`) that survives because the inner content itself contains a nested `[AI_ENHANCED]` opener, DOMPurify treats those NUL-character text nodes as suspicious and the surrounding `<p>` ends up blank.
- The split logic in `splitEnrichedSegments` strips the outer `[AI_ENHANCED]` wrappers but the markdown inside often starts with `**Heading:**\n- bullet`. When `markdownToHtml` then runs its own `[AI_ENHANCED]` extraction pass and finds nothing, it still rewrites the string in ways that can produce empty `<li>` items if the bullet line's inner text matches the bold regex greedily across multiple lines.

This explains why the first render (using `generatedContent['enriched_content']` straight from the API) looks fine, but the second render (using `note.enriched_content` after a refetch round-trip, possibly with slightly different whitespace) produces empty cards.

## Fix Plan

### 1. Make `SimpleEnhancementTabs` tab state sticky
- Remove the `internalActiveTab` fallback path. Treat `activeContentType` as the single source of truth and default to `'original'` only on the very first mount when it is undefined.
- Add a `useEffect` that syncs `internalActiveTab` whenever a defined `activeContentType` arrives, so the tab never silently resets.

### 2. Stop `NoteStudyView` from forcing tab back to Original after enrichment
- Ensure the `handleEnhancement` early-return path for `'enrich-note'` does not call `setActiveContentType` anywhere upstream. Audit `useSimpleEnhancement` and `StudyViewHeader` to confirm they don't reset `activeContentType` when enrichment completes.

### 3. Harden `EnrichedContentRenderer`
- Strip any leftover NUL placeholder tokens from the rendered HTML before sanitizing.
- Trim and normalize each segment's text (collapse `\r\n`, drop leading/trailing blank lines) before passing to `markdownToHtml`, so the second-render content matches the first.
- Loosen `sanitizeHTML` for this renderer only: pass content through DOMPurify with `KEEP_CONTENT: true` so stray inline text inside an unknown wrapper is preserved instead of dropped.
- Add a defensive fallback: if the post-sanitize HTML has zero visible text, render the raw segment text as a `<pre>` block so the user always sees their content instead of a blank green card.

### 4. Add lightweight diagnostics
- Console-log segment count, segment lengths, and final HTML length inside `EnrichedContentRenderer` (gated behind `import.meta.env.DEV`) so the next time the user reports an empty card we can pinpoint whether splitting, conversion, or sanitization is to blame.

## Files to edit
- `src/components/notes/study/SimpleEnhancementTabs.tsx`
- `src/components/notes/study/NoteStudyView.tsx`
- `src/components/notes/study/EnrichedContentRenderer.tsx`
- `src/utils/sanitize.ts` (add a second exported variant `sanitizeEnrichedHTML` that uses `KEEP_CONTENT: true`, leave the strict default untouched for other call sites)

## Out of scope
- No changes to the database schema, Supabase functions, or the AI enrichment pipeline.
- No changes to the visual style of the enriched cards (the green borders and ENRICHED badge stay exactly as they appear in the screenshot).

## Expected outcome
- Generating, then navigating away from and back to, the Enriched Note tab keeps focus on Enriched and shows the full enriched paragraphs and bullet content inside each green card.
- If a future content payload is malformed, the user sees the raw text instead of an empty card.

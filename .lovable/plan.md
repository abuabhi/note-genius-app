## Diagnosis

Your Top 10 Questions **were generated successfully**. I confirmed it directly in the database:

- Note `Physics 101` (`19e9f8de-…`) has `questions_status = 'completed'` and **3,828 characters** of valid markdown stored in `questions_content` (Q1–Q10 with answers, all intact).
- The tab header in your screenshot reflects this: it says "552 words • 3 min read", which means the content reaches the renderer.
- The body below the divider is blank, so the **markdown → HTML pipeline is silently dropping the rendered output** for this content — same failure family as the "Original tab is blank" bug we fixed yesterday.

The current path for the Questions tab is:

```text
questions_content (markdown)
   → ExpandableContentRenderer
   → processContentForDisplay (markdownToHtml)
   → SimpleContentRenderer
   → processContentForDisplay (called AGAIN)
   → RichTextDisplay
   → DOMPurify.sanitize (strict mode, KEEP_CONTENT: false)
   → dangerouslySetInnerHTML
```

That's two passes through the markdown converter plus a strict sanitizer. When something in the chain returns an empty string, the user sees a blank card with correct word count (because the count is calculated from the raw `displayContent`, not the rendered HTML).

## Fix

Treat the Questions tab the same way we treated the Original tab — render it through a robust path that cannot collapse to empty:

1. **Route the Questions tab through `PlainTextNoteRenderer`** in `SimpleEnhancementTabs.tsx`, alongside `original`. The Questions content from the AI is plain markdown (headers + bold), which `PlainTextNoteRenderer` handles correctly via paragraph splitting and `white-space: pre-wrap`. This guarantees something always renders.

2. **Add a lightweight markdown-aware path inside `PlainTextNoteRenderer`** so the Questions tab still gets visible `# / ##` headings and `**bold**` styling instead of looking like a wall of text. Keep the existing plain-text fallback for the Original tab unchanged.

3. **Harden `processContentForDisplay`** so the double-invocation (in `ExpandableContentRenderer` then again inside `SimpleContentRenderer`) cannot return empty: if the function ever produces an empty string from non-empty input, return the original content wrapped in `<pre>` as a safety net. This protects every other tab (Summary, Key Points, Markdown, Enriched) from the same silent-blank failure.

4. **Add a one-line console warning** when the renderer receives non-empty content but produces empty HTML, so we can see exactly which input pattern is breaking in the future without you having to report it.

## Files to change

- `src/components/notes/study/SimpleEnhancementTabs.tsx` — add `'questions'` to the safe-renderer branch.
- `src/components/notes/study/viewer/PlainTextNoteRenderer.tsx` — handle `# / ## / **bold**` so Q&A formatting is readable.
- `src/utils/markdownConverter.ts` — empty-output safety net inside `processContentForDisplay`.

No database changes. Your existing 3,828-character `questions_content` is intact and will display the moment the front-end fix ships.

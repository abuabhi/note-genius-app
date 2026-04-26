I understand the issue now: the note in the database does contain `[AI_ENHANCED]...[/AI_ENHANCED]` blocks, but the current renderer is still too indirect and fragile. It converts the whole content through the generic markdown/rich-text path, so the enriched block styling can be lost or not visibly distinct enough. I will simplify it instead of trying another tiny patch.

Plan:

1. Build a dedicated Enriched Note renderer
   - For the Enriched Note tab only, split the raw content directly on `[AI_ENHANCED]...[/AI_ENHANCED]` / `[AI_ENRICHED]...[/AI_ENRICHED]` tags before any generic markdown/rich-text rendering.
   - Render original note text normally.
   - Render every AI-added section as its own green box.
   - Add a visible pill label at the top of every box: `Enriched`.
   - Do not rely on the current placeholder conversion path for enriched sections.

2. Keep formatting inside the green boxes
   - Inside each green box, still convert markdown to HTML so bold text, paragraphs, headings, and bullet lists work.
   - Preserve the existing note content exactly; only the display layer changes.

3. Make malformed/missing tags survivable
   - Support both `AI_ENHANCED` and `AI_ENRICHED` tag names.
   - Support lowercase/mixed-case variants.
   - If an opening tag is missing a closing tag, show the rest of that section as an enriched green box instead of silently dropping the styling.

4. Wire it only into the Enriched Note tab
   - Update `ExpandableContentRenderer` / `SimpleEnhancementTabs` so `contentType === 'enriched'` uses the dedicated renderer.
   - Other tabs keep using the existing renderer so summaries, questions, original notes, and Original++ are not affected.

5. Strengthen CSS so the boxes are unmistakable
   - Add styling for a light green background, green border, rounded corners, spacing, and an `Enriched` badge.
   - Ensure the “hide coloring” toggle can still remove the green background/border if the user turns coloring off.

6. Add quick regression coverage / verification
   - Add or run a small renderer/converter check using sample content with original text plus multiple `[AI_ENHANCED]` blocks.
   - Verify the sample outputs visible enriched-card markup with preserved markdown formatting.

Technical details:

Current root cause:
```text
Database enriched_content has valid tags
        ↓
processContentForDisplay / markdownToHtml tries to convert everything generically
        ↓
RichTextDisplay/SimpleContentRenderer sanitize and render generic HTML
        ↓
The tag/card semantics are not guaranteed to survive visibly
```

New flow:
```text
Enriched tab raw content
        ↓
split into typed segments: original | enriched
        ↓
render original segments normally
render enriched segments as explicit <section class="ai-enriched-card">
        ↓
inside each card: markdown formatting still works
```

Files to update:
- `src/components/notes/study/EnrichedContentRenderer.tsx` or equivalent new dedicated renderer
- `src/components/notes/study/expansion/ExpandableContentRenderer.tsx`
- `src/components/notes/study/SimpleContentRenderer.css`
- possibly `src/utils/markdownConverter.ts` only to expose/reuse a safe helper, not as the primary enriched-tag solution
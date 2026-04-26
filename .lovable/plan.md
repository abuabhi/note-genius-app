I checked the database first: your original note is not gone. The note `Test 101` still has `3,811` characters of content stored, starting with `bio 3/4 foundation first class notes...`. So this is a display/rendering bug, not data loss.

Plan to fix it:

1. Make the Original tab use a safe, direct renderer
   - Original content should not go through the expansion/markdown pipeline that can accidentally sanitize or hide plain text.
   - Render stored `note.content` directly as readable paragraphs with preserved line breaks.

2. Add a visible fallback if rendering ever produces empty output
   - If the tab thinks content exists but the rendered body is empty, show the raw plain text instead of a blank white area.
   - This prevents the scary “word count exists but body is blank” state from happening again.

3. Fix misleading metadata wording
   - The header currently says `565 words`, while the screenshot says “characters”. I’ll make the count accurate and consistent so it’s clear what exists.

4. Protect the generated tabs separately
   - Keep Markdown/Original++/Summary/Key Points/Enriched/Questions using the richer renderer.
   - Only bypass the fragile path for Original, because Original is the source-of-truth content and must always be visible.

Technical details:

- Main file to update: `src/components/notes/study/SimpleEnhancementTabs.tsx`
- Likely supporting change: `src/components/notes/study/expansion/ExpandableContentRenderer.tsx` or a small new direct plain-text renderer inside the existing component structure.
- No database change is needed because the original content is present in `public.notes.content`.
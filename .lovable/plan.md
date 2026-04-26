I checked the current note record and the content is still present in the database:

- Original++: 4,300 characters, completed
- Summary: 2,261 characters, completed
- Key Points: 1,660 characters, completed
- Enriched Note: 9,739 characters, completed
- Top 10 Questions: 3,828 characters, completed

So this is not a generation/data-loss problem. It is a rendering problem: several tabs still use the older markdown/HTML renderer, which is leaving list bullets visible while the actual text is not reliably visible. The Top 10 Questions tab was moved to the safer renderer, which is why that one now shows content.

Plan:

1. Route all study enhancement tabs through the safe renderer
   - Use `PlainTextNoteRenderer` for Original++, Summary, Key Points, and Top 10 Questions.
   - Keep the special Enriched Note renderer only for Enriched Note because it has expansion/enriched-card behavior.
   - This removes the fragile renderer path that is currently producing blank bullets/text.

2. Make the safe renderer support the formats these tabs actually store
   - Handle existing HTML content such as Summary (`<h2>`, `<p>`, lists) without making text invisible.
   - Handle markdown content such as Original++ and Top 10 Questions.
   - Handle bullet-only/key-point content cleanly.
   - Add a final fallback so if processed output is empty, raw text is shown instead of a blank page.

3. Remove bold styling from Top 10 Questions answers/questions
   - Stop converting `**bold**` into bold text inside the safe renderer.
   - Strip markdown bold markers from the visible text instead.
   - Keep Q headings readable, but not heavy/bold in the answer body.

4. Unify the green color across the whole study enhancement UI
   - Replace hardcoded dark green `#236248`, Tailwind mint classes, and `hsl(var(--primary))` mismatches in this area with one consistent primary green token.
   - Apply the same green to active tab backgrounds, content headers, question headings, bullets, status dots, report/regenerate accents, and enriched cards.
   - The goal is that Summary, Key Points, Enriched Note, and Top 10 Questions no longer look like different greens.

5. Clean up CSS conflicts
   - Remove or override the old `.simple-content` rules that force hardcoded greens and bold question styles.
   - Keep list bullets and text using the same readable color system.

Technical files to update:

- `src/components/notes/study/SimpleEnhancementTabs.tsx`
- `src/components/notes/study/viewer/PlainTextNoteRenderer.tsx`
- `src/components/notes/study/SimpleContentRenderer.css`
- Possibly `src/components/notes/study/EnrichedContentRenderer.css` if its green differs from the unified token

Expected result:

- Original++, Summary, Key Points, Enriched Note, and Top 10 Questions all show their existing saved content.
- No tab shows just bullets with missing text.
- Top 10 Questions no longer bolds random words in Q/A content.
- All green accents in these tabs are visually consistent.
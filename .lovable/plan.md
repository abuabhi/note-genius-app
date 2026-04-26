## Problem

On the **Enriched** tab, selecting text → "Expand this topic" → "Confirm & Add to Note" causes:
1. The original enriched content disappears (empty green cards).
2. The newly added AI expansion is not visible either.

## Root cause

In `src/components/notes/study/expansion/ExpandableContentRenderer.tsx` the renderer is chosen like this:

```tsx
{contentType === 'enriched' && expansions.length === 0 ? (
  <EnrichedContentRenderer content={content} ... />
) : (
  <SimpleContentRenderer content={processedContent} ... />
)}
```

- While there are zero expansions, the dedicated `EnrichedContentRenderer` parses the `[AI_ENHANCED]` / `[AI_ENRICHED]` tag blocks and renders them as the green "Enriched" cards.
- The moment an expansion is confirmed, `expansions.length` becomes 1, so the component swaps to `SimpleContentRenderer`, which does not know how to render those AI tag blocks the same way.
- On top of that, the expansion-injection logic uses a plain `indexOf` on the HTML and pastes a `<div class="ai-expansion-content">…</div>` block in the middle of an enriched wrapper, breaking that wrapper and getting partly stripped by the sanitizer. End result: empty cards plus an invisible expansion.

The expansion itself IS saved correctly to `note_content_expansions` (DB write succeeds); it is purely a render bug.

## Fix

1. **Always use `EnrichedContentRenderer` on the Enriched tab**, expansions or not. Pass the expansions list down and render them inline as separate cards beneath the matching enriched block, instead of splicing HTML strings.
2. **Add an `expansions` prop to `EnrichedContentRenderer`** (`src/components/notes/study/EnrichedContentRenderer.tsx`):
   - For each parsed enriched segment, after rendering it, render any expansions whose `originalText` is contained in that segment.
   - Render each expansion as its own styled card (reusing `.ai-expansion-content` / `.ai-expansion-content-neutral` styles already defined) with the existing remove (×) button.
3. **In `ExpandableContentRenderer.tsx`**:
   - Drop the `&& expansions.length === 0` condition — Enriched tab always renders via `EnrichedContentRenderer`.
   - Forward `expansions`, `hideColoring`, and `removeExpansion` to it.
   - Keep `SimpleContentRenderer` + the existing HTML splicing path for non-enriched tabs (Original, Summary, etc.) where it already works.
4. **Defensive fallback**: if an expansion's `originalText` cannot be matched to any enriched segment (edge case), append it at the end of the rendered enriched content so it is never silently lost.
5. **Verification**: after the change, expand a paragraph on the Enriched tab → confirm → the original enriched cards stay intact AND a new italic card containing the AI expansion appears below the matching paragraph, with a working × remove button.

## Files to edit

- `src/components/notes/study/expansion/ExpandableContentRenderer.tsx` — remove the renderer-swap, pass expansions/handlers to `EnrichedContentRenderer`.
- `src/components/notes/study/EnrichedContentRenderer.tsx` — accept and render `expansions` inline per matching segment, with remove buttons.

No DB or edge function changes needed — the expansion is already persisted correctly.

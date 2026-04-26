I found the two concrete failures:

1. The generated enriched content in the database does contain `[AI_ENHANCED]...[/AI_ENHANCED]` blocks, but the renderer classifies the converted content as rich HTML and sends it through `RichTextDisplay`. The current conversion wraps enhancement blocks too early, so markdown inside/around those blocks is not consistently converted into the green enhanced sections the user expects.
2. Usage is not increasing because the edge function insert into `note_enrichment_usage` is failing. The deployed log shows: `null value in column "llm_provider" violates not-null constraint`. The function treats usage recording as non-fatal, so content generates, but no row is saved; therefore the UI keeps showing `0 / 20`.

Plan:

1. Fix enriched-note rendering at the source
   - Refactor the markdown display pipeline so `[AI_ENHANCED]` blocks are preserved, converted, and wrapped after markdown parsing, not before it breaks block handling.
   - Ensure every enhanced block renders as a light green box with the AI-enhanced styling, including paragraphs, headings, bold text, and lists inside the block.
   - Make `hideColoring` continue to work, but default enriched content should visibly show the green sections.

2. Add a compatibility repair for existing enriched notes
   - Existing notes like the current Bio 101 note already have raw `[AI_ENHANCED]` tags stored. The renderer will support those directly, so the user does not need to regenerate just to get boxes back.
   - Add a fallback normalizer that handles both `[AI_ENHANCED]` and `[AI_ENRICHED]`, including lowercase variants and extra whitespace.

3. Fix usage tracking in the edge function
   - Update `recordUsage` in `supabase/functions/enrich-note/index.ts` to insert all required non-null fields on `note_enrichment_usage`, especially `llm_provider`, plus safe defaults for token fields.
   - Keep counting by `user_id + month_year`, but make insertion errors visible enough in logs and response context during debugging.
   - Deploy the updated `enrich-note` edge function.

4. Make the counter update immediately after generation
   - In `SimpleEnhancementTabs`, after `generateEnhancement('enrich-note', ...)` succeeds, call `refetchUsage()` so the Enriched Note usage bar updates without waiting for a stale query timeout.
   - Keep the existing parent usage refresh too, but wire the tab-level generate button because that is the button being used on this screen.

5. Recheck the current note and user state
   - Verify the Bio 101 note’s enriched content now renders with multiple green enhanced boxes.
   - Verify a new enrich-note generation records a row in `note_enrichment_usage` and the counter changes from `0 / 20` to the correct value after generation.
   - Inspect edge function logs after deployment to confirm the `llm_provider` insert error is gone.

Technical details:

- Files to update:
  - `src/utils/markdownConverter.ts`
  - `src/components/notes/study/SimpleContentRenderer.tsx` and/or related CSS if needed
  - `src/components/ui/rich-text/RichTextDisplay.css` if styling gaps remain
  - `src/hooks/useEnhancementManager.ts` or `src/components/notes/study/SimpleEnhancementTabs.tsx` for usage refetch after tab generation
  - `supabase/functions/enrich-note/index.ts`

- Expected result:
  - Enriched Notes show original text normally and AI-added sections in light green bordered boxes.
  - The current note displays correctly without regeneration.
  - Usage count increments reliably after successful enriched-note generation and refreshes immediately in the UI.
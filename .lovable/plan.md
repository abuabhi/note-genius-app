I found the actual cause: the database table now has `ON DELETE SET NULL`, but the app still has deletion paths using `force_delete_note_optimized`, and that database function explicitly deletes rows from `note_enrichment_usage` for the note being deleted. That makes the monthly counter drop when notes are deleted, which is exactly the bug you’re seeing.

Plan:

1. Stop deleting usage rows during note deletion
   - Update `public.force_delete_note_optimized` so it deletes note-related child records, but does not delete `note_enrichment_usage`.
   - Instead, set `note_enrichment_usage.note_id = NULL` for the deleted note before deleting the note.
   - Update `public.force_delete_note` as well, because the `delete-note` edge function can still fall back to it.

2. Keep the database relationship user/month based
   - Keep `note_enrichment_usage.note_id` nullable.
   - Keep/ensure the foreign key is `ON DELETE SET NULL`, so usage history survives even if a note is deleted directly.
   - Leave counting logic as `WHERE user_id = current user AND month_year = current month`, not per note.

3. Fix all app-side delete paths to use the safe behavior
   - Existing React hooks call `force_delete_note_optimized`; after the DB function is fixed, those paths will preserve usage.
   - The `delete-note` edge function already has a comment saying usage should be preserved, but its fallback calls the unsafe `force_delete_note`; fixing that DB function closes the fallback hole too.

4. Repair current month data if possible
   - Check current `note_enrichment_usage` rows for the user/month.
   - Since deleted rows cannot always be reconstructed perfectly, preserve all remaining rows and verify the current count no longer drops after future note deletion.
   - If there are edge/audit logs showing prior successful enrichments, use them to restore missing usage rows; otherwise the permanent fix prevents future resets.

5. Make the UI harder to misread
   - Ensure the Enriched Note usage indicator is sourced only from `useAiEnrichmentUsage`, which counts by user/month.
   - Invalidate/refetch the `ai-enrichment-usage` query after generating enrichment and after deleting notes, so the displayed count stays accurate and does not show stale zero.

Technical files to change:
- Add a new Supabase migration to redefine `force_delete_note_optimized` and `force_delete_note` safely.
- Possibly update `supabase/functions/delete-note/index.ts` fallback if needed.
- Update note deletion hooks to invalidate `['ai-enrichment-usage']` after deletion.
- No per-note usage counter will be used for the monthly enrichment limit.
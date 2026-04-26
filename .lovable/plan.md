I’ll stop trying to route the dashboard CTA into the import modal and change it to the fallback you asked for: creating a first note.

Plan:
1. Update `src/components/dashboard/progressive/GetStartedHeroSection.tsx`
   - Change the primary CTA copy from `Upload PDF` to `Create your first note`.
   - Change the hero headline/body so it no longer promises PDF upload/import.
   - Change the click handler from `navigate('/notes?action=upload')` to `navigate('/notes')`.
   - Use the existing notes route only, avoiding the broken dialog auto-open behavior.

2. Update related new-user quick actions in `src/components/dashboard/progressive/QuickStartActions.tsx`
   - Keep `Create First Note` as the first action.
   - Change `Import Documents` so it no longer claims it will open the import dialog unless we are actually wiring that separately.
   - If needed, point it to `/notes` with neutral wording or remove the misleading import wording.

3. Leave the Notes page import button intact
   - Users can still open Import from the Notes page manually.
   - No more dashboard CTA promising an upload dialog that fails to open.
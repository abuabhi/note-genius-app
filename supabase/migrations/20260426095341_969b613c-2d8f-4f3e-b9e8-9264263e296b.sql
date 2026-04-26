
-- Preserve enrichment usage history when notes are deleted
ALTER TABLE public.note_enrichment_usage
  ALTER COLUMN note_id DROP NOT NULL;

ALTER TABLE public.note_enrichment_usage
  DROP CONSTRAINT IF EXISTS note_enrichment_usage_note_id_fkey;

ALTER TABLE public.note_enrichment_usage
  ADD CONSTRAINT note_enrichment_usage_note_id_fkey
  FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE SET NULL;

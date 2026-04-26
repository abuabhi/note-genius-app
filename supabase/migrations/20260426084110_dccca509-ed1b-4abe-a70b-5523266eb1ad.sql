ALTER TABLE public.note_enrichment_usage
  DROP CONSTRAINT IF EXISTS note_enrichment_usage_note_id_fkey;

ALTER TABLE public.note_enrichment_usage
  ADD CONSTRAINT note_enrichment_usage_note_id_fkey
  FOREIGN KEY (note_id)
  REFERENCES public.notes(id)
  ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.force_delete_note_optimized(note_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  deleted_count integer := 0;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1
      FROM public.notes
      WHERE id = note_id_param
        AND user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Unauthorized: cannot delete this note';
    END IF;
  END IF;

  DELETE FROM public.note_chat_messages WHERE note_id = note_id_param;
  DELETE FROM public.note_content_expansions WHERE note_id = note_id_param;
  DELETE FROM public.note_enrichment_usage WHERE note_id = note_id_param;
  DELETE FROM public.note_tags WHERE note_id = note_id_param;
  DELETE FROM public.scan_data WHERE note_id = note_id_param;
  DELETE FROM public.notes WHERE id = note_id_param;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Failed to delete note %: %', note_id_param, SQLERRM;
    RETURN false;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.force_delete_note_optimized(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.force_delete_note_optimized(uuid) TO authenticated, service_role;
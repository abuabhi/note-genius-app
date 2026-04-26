-- Make force_delete_note_optimized preserve enrichment usage history.
-- We unlink note_id (the FK is ON DELETE SET NULL anyway, but we do it
-- explicitly so the historical row is clearly retained) and never delete
-- from note_enrichment_usage.
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

  -- Preserve monthly AI enrichment usage history; just unlink it from the note.
  UPDATE public.note_enrichment_usage
     SET note_id = NULL
   WHERE note_id = note_id_param;

  DELETE FROM public.note_chat_messages WHERE note_id = note_id_param;
  DELETE FROM public.note_content_expansions WHERE note_id = note_id_param;
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
GRANT  EXECUTE ON FUNCTION public.force_delete_note_optimized(uuid) TO authenticated, service_role;

-- Same fix for the legacy fallback used by the delete-note edge function.
CREATE OR REPLACE FUNCTION public.force_delete_note(note_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Preserve monthly AI enrichment usage history; just unlink it.
  UPDATE public.note_enrichment_usage
     SET note_id = NULL
   WHERE note_id = $1;

  DELETE FROM public.note_tags WHERE note_id = $1;
  DELETE FROM public.scan_data WHERE note_id = $1;
  DELETE FROM public.notes      WHERE id      = $1;

  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Failed to force delete note: %', SQLERRM;
    RETURN false;
END;
$function$;
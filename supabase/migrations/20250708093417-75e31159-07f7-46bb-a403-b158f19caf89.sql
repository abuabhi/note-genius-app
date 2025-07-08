-- Drop and recreate the force_delete_note_optimized function with proper column references
DROP FUNCTION IF EXISTS public.force_delete_note_optimized(uuid);

CREATE OR REPLACE FUNCTION public.force_delete_note_optimized(note_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Use a single transaction for all deletes to ensure consistency
  BEGIN
    -- Temporarily disable RLS for this function to allow cascading deletes
    SET LOCAL row_security = off;
    
    -- Delete in order to respect foreign key constraints with fully qualified column references
    -- 1. Delete note chat messages first (depends on note_id)
    DELETE FROM public.note_chat_messages WHERE public.note_chat_messages.note_id = note_id_param;
    
    -- 2. Delete note content expansions (depends on note_id)
    DELETE FROM public.note_content_expansions WHERE public.note_content_expansions.note_id = note_id_param;
    
    -- 3. Delete note enrichment usage entries
    DELETE FROM public.note_enrichment_usage WHERE public.note_enrichment_usage.note_id = note_id_param;
    
    -- 4. Delete note tags
    DELETE FROM public.note_tags WHERE public.note_tags.note_id = note_id_param;
    
    -- 5. Delete scan data
    DELETE FROM public.scan_data WHERE public.scan_data.note_id = note_id_param;
    
    -- 6. Finally delete the note itself
    DELETE FROM public.notes WHERE public.notes.id = note_id_param;
    
    RETURN true;
  EXCEPTION
    WHEN others THEN
      -- Log the error and return false
      RAISE LOG 'Failed to delete note %: %', note_id_param, SQLERRM;
      RETURN false;
  END;
END;
$function$
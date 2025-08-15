-- Update the force_delete_note_optimized function to handle ALL foreign key constraints
CREATE OR REPLACE FUNCTION public.force_delete_note_optimized(note_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Use a single transaction for all deletes to ensure consistency
  BEGIN
    -- Delete in order to respect foreign key constraints
    -- 1. Delete note chat messages first (depends on note_id)
    DELETE FROM public.note_chat_messages WHERE note_id = $1;
    
    -- 2. Delete note content expansions (depends on note_id)
    DELETE FROM public.note_content_expansions WHERE note_id = $1;
    
    -- 3. Delete note enrichment usage entries
    DELETE FROM public.note_enrichment_usage WHERE note_id = $1;
    
    -- 4. Delete note tags
    DELETE FROM public.note_tags WHERE note_id = $1;
    
    -- 5. Delete scan data
    DELETE FROM public.scan_data WHERE note_id = $1;
    
    -- 6. Finally delete the note itself
    DELETE FROM public.notes WHERE id = $1;
    
    RETURN true;
  EXCEPTION
    WHEN others THEN
      -- Log the error and return false
      RAISE LOG 'Failed to delete note %: %', $1, SQLERRM;
      RETURN false;
  END;
END;
$function$
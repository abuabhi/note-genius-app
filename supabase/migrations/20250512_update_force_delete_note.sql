
-- Update the force delete function to be more robust
CREATE OR REPLACE FUNCTION public.force_delete_note(note_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the deletion attempt
  RAISE NOTICE 'Attempting to force delete note: %', note_id;
  
  -- Delete note enrichment usage entries first (most restrictive foreign key)
  DELETE FROM public.note_enrichment_usage WHERE note_id = $1;
  RAISE NOTICE 'Deleted note enrichment usage entries for note: %', note_id;
  
  -- Delete note tags
  DELETE FROM public.note_tags WHERE note_id = $1;
  RAISE NOTICE 'Deleted note tags for note: %', note_id;
  
  -- Delete scan data
  DELETE FROM public.scan_data WHERE note_id = $1;
  RAISE NOTICE 'Deleted scan data for note: %', note_id;
  
  -- Finally delete the note
  DELETE FROM public.notes WHERE id = $1;
  RAISE NOTICE 'Deleted note: %', note_id;
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Failed to force delete note (%): %', note_id, SQLERRM;
    RETURN false;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.force_delete_note TO service_role;

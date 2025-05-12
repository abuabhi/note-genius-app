
-- Create a database function to force delete a note using admin privileges
CREATE OR REPLACE FUNCTION public.force_delete_note(note_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete note enrichment usage entries
  DELETE FROM public.note_enrichment_usage WHERE note_id = $1;
  
  -- Delete note tags
  DELETE FROM public.note_tags WHERE note_id = $1;
  
  -- Delete scan data
  DELETE FROM public.scan_data WHERE note_id = $1;
  
  -- Finally delete the note
  DELETE FROM public.notes WHERE id = $1;
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Failed to force delete note: %', SQLERRM;
    RETURN false;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.force_delete_note TO service_role;

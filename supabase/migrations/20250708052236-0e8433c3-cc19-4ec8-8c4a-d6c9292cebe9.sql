-- Phase 1: Database Optimization - Add production-ready indexes for 100+ concurrent users

-- Add composite indexes for notes filtering and pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_updated ON notes(user_id, updated_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_subject ON notes(user_id, subject_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_archived ON notes(user_id, archived);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_pinned_updated ON notes(user_id, pinned, updated_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_source_type ON notes(user_id, source_type);

-- Add user_subjects index for faster subject lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subjects_user_name ON user_subjects(user_id, name);

-- Add indexes for note enhancement features
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_enrichment_usage_note_user ON note_enrichment_usage(note_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_note_tags_note_user ON note_tags(note_id);

-- Add full text search index for notes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_title_search ON notes USING gin(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_content_search ON notes USING gin(to_tsvector('english', content));

-- Add scan_data index for faster deletion
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scan_data_note_id ON scan_data(note_id);

-- Optimize the delete note function for concurrent operations
CREATE OR REPLACE FUNCTION public.force_delete_note_optimized(note_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use a single transaction for all deletes to ensure consistency
  BEGIN
    -- Delete in order to respect foreign key constraints
    DELETE FROM public.note_enrichment_usage WHERE note_id = $1;
    DELETE FROM public.note_tags WHERE note_id = $1;
    DELETE FROM public.scan_data WHERE note_id = $1;
    DELETE FROM public.notes WHERE id = $1;
    
    RETURN true;
  EXCEPTION
    WHEN others THEN
      -- Log the error and return false
      RAISE LOG 'Failed to delete note %: %', $1, SQLERRM;
      RETURN false;
  END;
END;
$$;
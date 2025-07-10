
-- Phase 1: Create unified server-side filtering functions for all entity types

-- 1. Notes filtering function with optimized joins and pagination
CREATE OR REPLACE FUNCTION filter_user_notes(
  p_user_id uuid,
  p_search_term text DEFAULT '',
  p_subject_name text DEFAULT 'all',
  p_show_archived boolean DEFAULT false,
  p_sort_by text DEFAULT 'newest',
  p_page_num integer DEFAULT 0,
  p_page_size integer DEFAULT 20
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_count integer;
  has_more boolean;
  notes_data jsonb;
BEGIN
  -- Build the main query with proper joins and filtering
  WITH filtered_notes AS (
    SELECT 
      n.id,
      n.title,
      n.description,
      n.content,
      n.date,
      n.subject,
      n.subject_id,
      n.source_type,
      n.archived,
      n.pinned,
      n.created_at,
      n.updated_at,
      COALESCE(us.name, n.subject, 'Uncategorized') as subject_name,
      ARRAY(
        SELECT jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'color', t.color
        )
        FROM note_tags nt
        JOIN tags t ON t.id = nt.tag_id
        WHERE nt.note_id = n.id
      ) as tags
    FROM notes n
    LEFT JOIN user_subjects us ON us.id = n.subject_id
    WHERE n.user_id = p_user_id
      AND (NOT p_show_archived AND n.archived = false OR p_show_archived)
      AND (
        p_search_term = '' OR 
        n.title ILIKE '%' || p_search_term || '%' OR 
        n.description ILIKE '%' || p_search_term || '%'
      )
      AND (
        p_subject_name = 'all' OR 
        COALESCE(us.name, n.subject) = p_subject_name
      )
  ),
  sorted_notes AS (
    SELECT *
    FROM filtered_notes
    ORDER BY 
      CASE WHEN p_sort_by = 'newest' THEN pinned END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'newest' THEN updated_at END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'oldest' THEN pinned END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'oldest' THEN created_at END ASC NULLS LAST,
      CASE WHEN p_sort_by = 'alphabetical' THEN pinned END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'alphabetical' THEN title END ASC NULLS LAST
  ),
  paginated_notes AS (
    SELECT *
    FROM sorted_notes
    LIMIT p_page_size
    OFFSET (p_page_num * p_page_size)
  )
  SELECT 
    COUNT(*) INTO total_count
  FROM filtered_notes;
  
  -- Check if there are more pages
  has_more := total_count > ((p_page_num + 1) * p_page_size);
  
  -- Get the paginated data
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'title', title,
      'description', description,
      'content', content,
      'date', date,
      'subject', subject_name,
      'sourceType', source_type,
      'archived', archived,
      'pinned', pinned,
      'subject_id', subject_id,
      'tags', tags
    )
  ) INTO notes_data
  FROM paginated_notes;
  
  -- Build final result
  result := jsonb_build_object(
    'data', COALESCE(notes_data, '[]'::jsonb),
    'total_count', total_count,
    'has_more', has_more,
    'current_page', p_page_num,
    'page_size', p_page_size
  );
  
  RETURN result;
END;
$$;

-- 2. Flashcard sets filtering function
CREATE OR REPLACE FUNCTION filter_user_flashcard_sets(
  p_user_id uuid,
  p_search_term text DEFAULT '',
  p_subject_name text DEFAULT 'all',
  p_sort_by text DEFAULT 'newest',
  p_page_num integer DEFAULT 0,
  p_page_size integer DEFAULT 20
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_count integer;
  has_more boolean;
  sets_data jsonb;
BEGIN
  WITH filtered_sets AS (
    SELECT 
      fs.id,
      fs.name,
      fs.description,
      fs.subject,
      fs.subject_id,
      fs.card_count,
      fs.created_at,
      fs.updated_at,
      COALESCE(us.name, fs.subject, 'Uncategorized') as subject_name
    FROM flashcard_sets fs
    LEFT JOIN user_subjects us ON us.id = fs.subject_id
    WHERE fs.user_id = p_user_id
      AND (
        p_search_term = '' OR 
        fs.name ILIKE '%' || p_search_term || '%' OR 
        fs.description ILIKE '%' || p_search_term || '%'
      )
      AND (
        p_subject_name = 'all' OR 
        COALESCE(us.name, fs.subject) = p_subject_name
      )
  ),
  sorted_sets AS (
    SELECT *
    FROM filtered_sets
    ORDER BY 
      CASE WHEN p_sort_by = 'newest' THEN updated_at END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'oldest' THEN created_at END ASC NULLS LAST,
      CASE WHEN p_sort_by = 'alphabetical' THEN name END ASC NULLS LAST
  ),
  paginated_sets AS (
    SELECT *
    FROM sorted_sets
    LIMIT p_page_size
    OFFSET (p_page_num * p_page_size)
  )
  SELECT 
    COUNT(*) INTO total_count
  FROM filtered_sets;
  
  has_more := total_count > ((p_page_num + 1) * p_page_size);
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'description', description,
      'subject', subject_name,
      'subject_id', subject_id,
      'card_count', card_count,
      'created_at', created_at,
      'updated_at', updated_at
    )
  ) INTO sets_data
  FROM paginated_sets;
  
  result := jsonb_build_object(
    'data', COALESCE(sets_data, '[]'::jsonb),
    'total_count', total_count,
    'has_more', has_more,
    'current_page', p_page_num,
    'page_size', p_page_size
  );
  
  RETURN result;
END;
$$;

-- 3. Quizzes filtering function
CREATE OR REPLACE FUNCTION filter_user_quizzes(
  p_user_id uuid,
  p_search_term text DEFAULT '',
  p_subject_name text DEFAULT 'all',
  p_sort_by text DEFAULT 'newest',
  p_page_num integer DEFAULT 0,
  p_page_size integer DEFAULT 20
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_count integer;
  has_more boolean;
  quizzes_data jsonb;
BEGIN
  WITH filtered_quizzes AS (
    SELECT 
      q.id,
      q.title,
      q.description,
      q.source_type,
      q.is_public,
      q.created_at,
      q.updated_at,
      COALESCE(us.name, 'Uncategorized') as subject_name,
      q.subject_id
    FROM quizzes q
    LEFT JOIN user_subjects us ON us.id = q.subject_id
    WHERE (q.user_id = p_user_id OR q.is_public = true)
      AND (
        p_search_term = '' OR 
        q.title ILIKE '%' || p_search_term || '%' OR 
        q.description ILIKE '%' || p_search_term || '%'
      )
      AND (
        p_subject_name = 'all' OR 
        us.name = p_subject_name
      )
  ),
  sorted_quizzes AS (
    SELECT *
    FROM filtered_quizzes
    ORDER BY 
      CASE WHEN p_sort_by = 'newest' THEN updated_at END DESC NULLS LAST,
      CASE WHEN p_sort_by = 'oldest' THEN created_at END ASC NULLS LAST,
      CASE WHEN p_sort_by = 'alphabetical' THEN title END ASC NULLS LAST
  ),
  paginated_quizzes AS (
    SELECT *
    FROM sorted_quizzes
    LIMIT p_page_size
    OFFSET (p_page_num * p_page_size)
  )
  SELECT 
    COUNT(*) INTO total_count
  FROM filtered_quizzes;
  
  has_more := total_count > ((p_page_num + 1) * p_page_size);
  
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'title', title,
      'description', description,
      'subject', subject_name,
      'subject_id', subject_id,
      'source_type', source_type,
      'is_public', is_public,
      'created_at', created_at,
      'updated_at', updated_at
    )
  ) INTO quizzes_data
  FROM paginated_quizzes;
  
  result := jsonb_build_object(
    'data', COALESCE(quizzes_data, '[]'::jsonb),
    'total_count', total_count,
    'has_more', has_more,
    'current_page', p_page_num,
    'page_size', p_page_size
  );
  
  RETURN result;
END;
$$;

-- 4. Add indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_notes_user_search ON notes(user_id, title, description);
CREATE INDEX IF NOT EXISTS idx_notes_user_subject ON notes(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_archived ON notes(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user_search ON flashcard_sets(user_id, name);
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user_subject ON flashcard_sets(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_search ON quizzes(user_id, title);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_subject ON quizzes(user_id, subject_id);

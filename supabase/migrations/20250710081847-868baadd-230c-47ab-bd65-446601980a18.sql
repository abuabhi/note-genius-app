-- Fix the filter_user_notes function structure to resolve paginated_notes scope error
DROP FUNCTION IF EXISTS public.filter_user_notes(uuid, text, text, boolean, text, integer, integer);

CREATE OR REPLACE FUNCTION public.filter_user_notes(
  p_user_id uuid, 
  p_search_term text DEFAULT ''::text, 
  p_subject_name text DEFAULT 'all'::text, 
  p_show_archived boolean DEFAULT false, 
  p_sort_by text DEFAULT 'newest'::text, 
  p_page_num integer DEFAULT 0, 
  p_page_size integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
BEGIN
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
  ),
  total_count AS (
    SELECT COUNT(*) as count FROM filtered_notes
  )
  SELECT jsonb_build_object(
    'data', COALESCE(
      (SELECT jsonb_agg(
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
      ) FROM paginated_notes), 
      '[]'::jsonb
    ),
    'total_count', (SELECT count FROM total_count),
    'has_more', (SELECT count FROM total_count) > ((p_page_num + 1) * p_page_size),
    'current_page', p_page_num,
    'page_size', p_page_size
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Fix the filter_user_flashcard_sets function structure
DROP FUNCTION IF EXISTS public.filter_user_flashcard_sets(uuid, text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.filter_user_flashcard_sets(
  p_user_id uuid, 
  p_search_term text DEFAULT ''::text, 
  p_subject_name text DEFAULT 'all'::text, 
  p_sort_by text DEFAULT 'newest'::text, 
  p_page_num integer DEFAULT 0, 
  p_page_size integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
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
  ),
  total_count AS (
    SELECT COUNT(*) as count FROM filtered_sets
  )
  SELECT jsonb_build_object(
    'data', COALESCE(
      (SELECT jsonb_agg(
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
      ) FROM paginated_sets),
      '[]'::jsonb
    ),
    'total_count', (SELECT count FROM total_count),
    'has_more', (SELECT count FROM total_count) > ((p_page_num + 1) * p_page_size),
    'current_page', p_page_num,
    'page_size', p_page_size
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Fix the filter_user_quizzes function structure
DROP FUNCTION IF EXISTS public.filter_user_quizzes(uuid, text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.filter_user_quizzes(
  p_user_id uuid, 
  p_search_term text DEFAULT ''::text, 
  p_subject_name text DEFAULT 'all'::text, 
  p_sort_by text DEFAULT 'newest'::text, 
  p_page_num integer DEFAULT 0, 
  p_page_size integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result jsonb;
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
  ),
  total_count AS (
    SELECT COUNT(*) as count FROM filtered_quizzes
  )
  SELECT jsonb_build_object(
    'data', COALESCE(
      (SELECT jsonb_agg(
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
      ) FROM paginated_quizzes),
      '[]'::jsonb
    ),
    'total_count', (SELECT count FROM total_count),
    'has_more', (SELECT count FROM total_count) > ((p_page_num + 1) * p_page_size),
    'current_page', p_page_num,
    'page_size', p_page_size
  ) INTO result;
  
  RETURN result;
END;
$function$;
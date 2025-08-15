-- Phase 2: Update quiz filtering function to prioritize user_subject_id
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
SET search_path TO ''
AS $$
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
      -- Prioritize user_subject_id over legacy subject_id
      COALESCE(us.name, us_legacy.name, 'Uncategorized') as subject_name,
      COALESCE(q.user_subject_id, q.subject_id) as effective_subject_id
    FROM public.quizzes q
    -- Primary join: user_subject_id to user_subjects
    LEFT JOIN public.user_subjects us ON us.id = q.user_subject_id
    -- Fallback join: legacy subject_id to user_subjects  
    LEFT JOIN public.user_subjects us_legacy ON us_legacy.id = q.subject_id AND q.user_subject_id IS NULL
    WHERE (q.user_id = p_user_id OR q.is_public = true)
      AND (
        p_search_term = '' OR 
        q.title ILIKE '%' || p_search_term || '%' OR 
        q.description ILIKE '%' || p_search_term || '%'
      )
      AND (
        p_subject_name = 'all' OR 
        COALESCE(us.name, us_legacy.name) = p_subject_name
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
          'subject_id', effective_subject_id,
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
$$;
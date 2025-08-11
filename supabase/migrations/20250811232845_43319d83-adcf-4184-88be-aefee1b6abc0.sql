-- Security hardening migration: add ownership guards, drop unsafe exec_sql, and restrict PII/system RPCs

-- 1) Drop arbitrary SQL executor if present
DROP FUNCTION IF EXISTS public.exec_sql(text);

-- 2) Add ownership guards to client-exposed SECURITY DEFINER functions

-- 2.1 filter_user_notes: ensure caller can only request their own data
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
SET search_path TO ''
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Ownership guard: allow service_role (auth.uid() IS NULL), otherwise require self-access
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot view other users'' notes';
  END IF;

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
        FROM public.note_tags nt
        JOIN public.tags t ON t.id = nt.tag_id
        WHERE nt.note_id = n.id
      ) as tags
    FROM public.notes n
    LEFT JOIN public.user_subjects us ON us.id = n.subject_id
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

-- 2.2 filter_user_flashcard_sets: ownership guard
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
SET search_path TO ''
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot view other users'' flashcard sets';
  END IF;

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
    FROM public.flashcard_sets fs
    LEFT JOIN public.user_subjects us ON us.id = fs.subject_id
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

-- 2.3 filter_user_quizzes: ownership guard
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
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot view other users'' quizzes';
  END IF;

  WITH filtered_quizzes AS (
    SELECT 
      q.id,
      q.title,
      q.description,
      q.source_type,
      q.is_public,
      q.created_at,
      q.updated_at,
      COALESCE(us.name, us_legacy.name, 'Uncategorized') as subject_name,
      COALESCE(q.user_subject_id, q.subject_id) as effective_subject_id
    FROM public.quizzes q
    LEFT JOIN public.user_subjects us ON us.id = q.user_subject_id
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
          'source_type', source_type,
          'is_public', is_public,
          'created_at', created_at,
          'updated_at', updated_at,
          'subject', subject_name,
          'subject_id', effective_subject_id
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

-- 2.4 get_overdue_todos: ownership guard
CREATE OR REPLACE FUNCTION public.get_overdue_todos(p_user_id uuid)
RETURNS TABLE(
  todo_id uuid, title text, description text, due_date date, 
  days_overdue integer, in_grace_period boolean, escalation_level text, priority text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot view other users'' todos';
  END IF;

  RETURN QUERY
  SELECT 
    r.id as todo_id,
    r.title,
    r.description,
    r.due_date,
    (CURRENT_DATE - r.due_date)::integer as days_overdue,
    (CURRENT_DATE - r.due_date)::integer <= r.grace_period_days as in_grace_period,
    r.escalation_level,
    r.priority
  FROM public.reminders r
  WHERE r.user_id = p_user_id
    AND r.type = 'todo'
    AND r.status = 'pending'
    AND r.due_date < CURRENT_DATE
    AND r.auto_archived_at IS NULL
  ORDER BY r.due_date ASC, r.escalation_level DESC;
END;
$function$;

-- 2.5 get_overdue_goals: ownership guard
CREATE OR REPLACE FUNCTION public.get_overdue_goals(p_user_id uuid)
RETURNS TABLE(
  goal_id uuid, title text, end_date date, days_overdue integer, in_grace_period boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot view other users'' goals';
  END IF;

  RETURN QUERY
  SELECT 
    sg.id as goal_id,
    sg.title,
    sg.end_date,
    (CURRENT_DATE - sg.end_date)::integer as days_overdue,
    (CURRENT_DATE - sg.end_date)::integer <= sg.grace_period_days as in_grace_period
  FROM public.study_goals sg
  WHERE sg.user_id = p_user_id
    AND sg.status = 'active'
    AND sg.end_date < CURRENT_DATE
    AND sg.is_completed = false
  ORDER BY sg.end_date ASC;
END;
$function$;

-- 2.6 get_user_reminders_paginated: ownership guard
CREATE OR REPLACE FUNCTION public.get_user_reminders_paginated(
  p_user_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_status text[] DEFAULT ARRAY['pending'::text, 'sent'::text]
)
RETURNS TABLE(
  id uuid, user_id uuid, title text, description text, reminder_time timestamptz,
  due_date date, type text, status text, priority text, escalation_level text,
  delivery_methods jsonb, recurrence text, created_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot view other users'' reminders';
  END IF;

  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.reminder_time,
    r.due_date,
    r.type,
    r.status,
    r.priority,
    r.escalation_level,
    r.delivery_methods,
    r.recurrence,
    r.created_at,
    r.updated_at
  FROM public.reminders r
  WHERE r.user_id = p_user_id
    AND r.status = ANY(p_status)
  ORDER BY r.reminder_time ASC NULLS LAST, r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- 2.7 check_and_award_achievements: ownership guard
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id uuid)
RETURNS TABLE(new_achievement_title text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  flashcard_review_count INTEGER;
  flashcard_set_count INTEGER;
  study_session_count INTEGER;
  goal_count INTEGER;
  streak_days INTEGER;
  awarded BOOLEAN;
BEGIN
  IF auth.uid() IS NOT NULL AND p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot award achievements for other users';
  END IF;

  -- Existing logic
  SELECT COUNT(*) INTO flashcard_review_count
  FROM user_flashcard_progress 
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO flashcard_set_count
  FROM flashcard_sets 
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO study_session_count
  FROM study_sessions 
  WHERE user_id = p_user_id AND end_time IS NOT NULL;
  
  SELECT COUNT(*) INTO goal_count
  FROM study_goals 
  WHERE user_id = p_user_id AND is_completed = true;
  
  WITH study_dates AS (
    SELECT DISTINCT DATE(last_reviewed_at) as study_date
    FROM user_flashcard_progress 
    WHERE user_id = p_user_id 
    AND last_reviewed_at IS NOT NULL
    ORDER BY study_date DESC
  )
  SELECT COUNT(*) INTO streak_days FROM study_dates LIMIT 7;
  
  IF flashcard_review_count >= 1 THEN
    SELECT award_achievement(p_user_id, 'First Steps') INTO awarded;
    IF awarded THEN
      new_achievement_title := 'First Steps';
      RETURN NEXT;
    END IF;
  END IF;
  
  IF flashcard_set_count >= 1 THEN
    SELECT award_achievement(p_user_id, 'Getting Started') INTO awarded;
    IF awarded THEN
      new_achievement_title := 'Getting Started';
      RETURN NEXT;
    END IF;
  END IF;
  
  IF streak_days >= 3 THEN
    SELECT award_achievement(p_user_id, 'Study Streak') INTO awarded;
    IF awarded THEN
      new_achievement_title := 'Study Streak';
      RETURN NEXT;
    END IF;
  END IF;
  
  IF streak_days >= 7 THEN
    SELECT award_achievement(p_user_id, 'Week Warrior') INTO awarded;
    IF awarded THEN
      new_achievement_title := 'Week Warrior';
      RETURN NEXT;
    END IF;
  END IF;
  
  IF flashcard_set_count >= 10 THEN
    SELECT award_achievement(p_user_id, 'Flashcard Master') INTO awarded;
    IF awarded THEN
      new_achievement_title := 'Flashcard Master';
      RETURN NEXT;
    END IF;
  END IF;
  
  IF goal_count >= 5 THEN
    SELECT award_achievement(p_user_id, 'Goal Crusher') INTO awarded;
    IF awarded THEN
      new_achievement_title := 'Goal Crusher';
      RETURN NEXT;
    END IF;
  END IF;
  
  IF flashcard_review_count >= 100 THEN
    SELECT award_achievement(p_user_id, 'Century Club') INTO awarded;
    IF awarded THEN
      new_achievement_title := 'Century Club';
      RETURN NEXT;
    END IF;
  END IF;
  
  IF study_session_count >= 20 THEN
    SELECT award_achievement(p_user_id, 'Study Session Champion') INTO awarded;
    IF awarded THEN
      new_achievement_title := 'Study Session Champion';
      RETURN NEXT;
    END IF;
  END IF;
END;
$function$;

-- 2.8 process_referral_signup: ensure referred_user_id is the caller
CREATE OR REPLACE FUNCTION public.process_referral_signup(
  referred_user_id uuid,
  referral_code_used text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  referrer_profile RECORD;
  new_referral_id UUID;
BEGIN
  IF auth.uid() IS NOT NULL AND referred_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot process referral for another user';
  END IF;

  SELECT * INTO referrer_profile
  FROM public.profiles 
  WHERE referral_code = referral_code_used
  AND id != referred_user_id; 
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.referrals 
    WHERE referred_user_id = process_referral_signup.referred_user_id
  ) THEN
    RETURN FALSE;
  END IF;
  
  INSERT INTO public.referrals (
    referrer_id,
    referred_user_id,
    referral_code,
    status,
    points_awarded
  ) VALUES (
    referrer_profile.id,
    process_referral_signup.referred_user_id,
    referral_code_used,
    'completed',
    100
  ) RETURNING id INTO new_referral_id;
  
  UPDATE public.contest_entries 
  SET 
    referrals_count = referrals_count + 1,
    is_eligible = (referrals_count + 1) >= (
      SELECT min_referrals_required 
      FROM public.contests 
      WHERE id = contest_entries.contest_id
    ),
    updated_at = now()
  WHERE user_id = referrer_profile.id
  AND contest_id IN (
    SELECT id FROM public.contests 
    WHERE is_active = true 
    AND start_date <= now() 
    AND end_date >= now()
  );
  
  RETURN TRUE;
END;
$function$;

-- 2.9 force_delete_note_optimized: add ownership guard for non-service callers
CREATE OR REPLACE FUNCTION public.force_delete_note_optimized(note_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Ownership guard: allow service_role (auth.uid() IS NULL), otherwise require ownership
  IF auth.uid() IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.notes 
      WHERE public.notes.id = note_id_param AND public.notes.user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Unauthorized: cannot delete another user''s note';
    END IF;
  END IF;

  -- Use a single transaction for all deletes to ensure consistency
  BEGIN
    SET LOCAL row_security = off;
    
    DELETE FROM public.note_chat_messages WHERE public.note_chat_messages.note_id = note_id_param;
    DELETE FROM public.note_content_expansions WHERE public.note_content_expansions.note_id = note_id_param;
    DELETE FROM public.note_enrichment_usage WHERE public.note_enrichment_usage.note_id = note_id_param;
    DELETE FROM public.note_tags WHERE public.note_tags.note_id = note_id_param;
    DELETE FROM public.scan_data WHERE public.scan_data.note_id = note_id_param;
    DELETE FROM public.notes WHERE public.notes.id = note_id_param;
    
    RETURN true;
  EXCEPTION
    WHEN others THEN
      RAISE LOG 'Failed to delete note %: %', note_id_param, SQLERRM;
      RETURN false;
  END;
END;
$function$;

-- 3) Restrict EXECUTE on PII/system functions to service_role only
DO $$
BEGIN
  -- get_user_email_for_feedback(feedback_user_id uuid)
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_user_email_for_feedback'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.get_user_email_for_feedback(uuid) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.get_user_email_for_feedback(uuid) TO service_role;
  END IF;

  -- get_digest_users()
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_digest_users'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.get_digest_users() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.get_digest_users() TO service_role;
  END IF;

  -- cleanup_expired_suggestions_cache()
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'cleanup_expired_suggestions_cache'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.cleanup_expired_suggestions_cache() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.cleanup_expired_suggestions_cache() TO service_role;
  END IF;

  -- cleanup_expired_analytics_cache()
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'cleanup_expired_analytics_cache'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.cleanup_expired_analytics_cache() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.cleanup_expired_analytics_cache() TO service_role;
  END IF;

  -- auto_escalate_overdue_todos()
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'auto_escalate_overdue_todos'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.auto_escalate_overdue_todos() FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.auto_escalate_overdue_todos() TO service_role;
  END IF;

  -- cleanup_old_reminders(retention_days integer)
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'cleanup_old_reminders'
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.cleanup_old_reminders(integer) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.cleanup_old_reminders(integer) TO service_role;
  END IF;
END $$;
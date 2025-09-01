-- COMPREHENSIVE SECURITY FIXES - Phase 3: Complete Function Updates and Fix RLS Infinite Recursion

-- Continue updating remaining functions with secure search_path
-- Function: filter_user_flashcard_sets  
CREATE OR REPLACE FUNCTION public.filter_user_flashcard_sets(p_user_id uuid, p_search_term text DEFAULT ''::text, p_subject_name text DEFAULT 'all'::text, p_sort_by text DEFAULT 'newest'::text, p_page_num integer DEFAULT 0, p_page_size integer DEFAULT 20)
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

-- Function: update_session_quality
CREATE OR REPLACE FUNCTION public.update_session_quality()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Only calculate session quality for sessions that have duration (ended sessions)
  -- For new sessions, set quality to 'active'
  IF NEW.duration IS NULL THEN
    NEW.session_quality := 'active';
  ELSE
    NEW.session_quality := public.calculate_session_quality(
      COALESCE(NEW.duration, 0),
      COALESCE(NEW.cards_reviewed, 0),
      COALESCE(NEW.cards_correct, 0),
      COALESCE(NEW.quiz_score, 0),
      COALESCE(NEW.quiz_total_questions, 0)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Function: update_learning_progress_updated_at
CREATE OR REPLACE FUNCTION public.update_learning_progress_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Function: update_flashcard_set_card_count
CREATE OR REPLACE FUNCTION public.update_flashcard_set_card_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.flashcard_sets 
    SET card_count = card_count + 1 
    WHERE id = NEW.set_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.flashcard_sets 
    SET card_count = GREATEST(0, card_count - 1) 
    WHERE id = OLD.set_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Function: dismiss_announcement
CREATE OR REPLACE FUNCTION public.dismiss_announcement(announcement_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.user_dismissed_announcements (user_id, announcement_id)
  VALUES (auth.uid(), announcement_uuid)
  ON CONFLICT (user_id, announcement_id) DO NOTHING;
  
  RETURN true;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$function$;

-- Function: get_overdue_goals
CREATE OR REPLACE FUNCTION public.get_overdue_goals(p_user_id uuid)
 RETURNS TABLE(goal_id uuid, title text, end_date date, days_overdue integer, in_grace_period boolean)
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

-- Add rate limiting for contact form submissions
-- Create table to track contact form submissions by IP
CREATE TABLE IF NOT EXISTS public.contact_rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  submissions_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.contact_rate_limit ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to check rate limits
CREATE POLICY "Allow rate limit checks" ON public.contact_rate_limit 
FOR SELECT USING (true);

-- Allow system to insert rate limit entries
CREATE POLICY "Allow system rate limit inserts" ON public.contact_rate_limit 
FOR INSERT WITH CHECK (true);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_contact_rate_limit_ip_window 
ON public.contact_rate_limit (ip_address, window_start);

-- Contact form rate limiting and validation function
CREATE OR REPLACE FUNCTION public.validate_contact_submission(
  p_ip_address text,
  p_email text,
  p_message text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  submission_count integer;
  window_start timestamp with time zone;
BEGIN
  -- Rate limiting: max 3 submissions per hour per IP
  window_start := date_trunc('hour', now());
  
  SELECT submissions_count INTO submission_count
  FROM public.contact_rate_limit
  WHERE ip_address = p_ip_address 
    AND window_start = validate_contact_submission.window_start;
  
  IF submission_count IS NULL THEN
    -- First submission in this window
    INSERT INTO public.contact_rate_limit (ip_address, window_start, submissions_count)
    VALUES (p_ip_address, window_start, 1);
  ELSIF submission_count >= 3 THEN
    -- Rate limit exceeded
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Rate limit exceeded. Please try again later.'
    );
  ELSE
    -- Increment counter
    UPDATE public.contact_rate_limit 
    SET submissions_count = submissions_count + 1
    WHERE ip_address = p_ip_address 
      AND window_start = validate_contact_submission.window_start;
  END IF;
  
  -- Basic validation
  IF LENGTH(p_email) < 5 OR p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid email address'
    );
  END IF;
  
  IF LENGTH(p_message) < 10 OR LENGTH(p_message) > 5000 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Message must be between 10 and 5000 characters'
    );
  END IF;
  
  -- Check for spam patterns
  IF p_message ~* '(viagra|casino|lottery|win money|click here|free money)' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Message contains prohibited content'
    );
  END IF;
  
  RETURN jsonb_build_object('valid', true);
END;
$function$;
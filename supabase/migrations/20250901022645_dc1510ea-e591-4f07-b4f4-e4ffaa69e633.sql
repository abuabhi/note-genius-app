-- COMPREHENSIVE SECURITY FIXES
-- Phase 1: Fix Function Search Path Vulnerabilities

-- Update all existing functions to use secure search_path
-- This prevents search_path injection attacks

-- Function: update_study_music_tracks_updated_at
CREATE OR REPLACE FUNCTION public.update_study_music_tracks_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function: get_ai_enrichment_count_for_billing_cycle  
CREATE OR REPLACE FUNCTION public.get_ai_enrichment_count_for_billing_cycle(user_id_param uuid, cycle_start_param date, cycle_end_param timestamp with time zone)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.note_enrichment_usage
    WHERE user_id = user_id_param
    AND created_at >= cycle_start_param::timestamp with time zone
    AND created_at <= cycle_end_param
  );
END;
$function$;

-- Function: log_quiz_creation_debug
CREATE OR REPLACE FUNCTION public.log_quiz_creation_debug(quiz_data jsonb, context text DEFAULT 'quiz_creation'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Log quiz creation for debugging (can be removed later)
  RAISE LOG 'QUIZ_DEBUG [%]: %', context, quiz_data::text;
END;
$function$;

-- Function: normalize_referral_code_fn
CREATE OR REPLACE FUNCTION public.normalize_referral_code_fn()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF NEW.referral_code IS NOT NULL THEN
    NEW.referral_code := UPPER(regexp_replace(NEW.referral_code, '[^a-zA-Z0-9]', '', 'g'));
  END IF;
  RETURN NEW;
END;
$function$;

-- Function: update_admin_settings_updated_at
CREATE OR REPLACE FUNCTION public.update_admin_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Function: validate_quiz_subject_mapping
CREATE OR REPLACE FUNCTION public.validate_quiz_subject_mapping()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- For new quizzes, require either user_subject_id or ensure we have subject_id
  IF TG_OP = 'INSERT' THEN
    -- If user_subject_id is NULL but we have subject_id, sync them
    IF NEW.user_subject_id IS NULL AND NEW.subject_id IS NOT NULL THEN
      NEW.user_subject_id := NEW.subject_id;
    END IF;
    
    -- If both are NULL, reject the insert
    IF NEW.user_subject_id IS NULL AND NEW.subject_id IS NULL THEN
      RAISE EXCEPTION 'Quiz must have a valid subject. Both user_subject_id and subject_id are NULL for quiz: %', NEW.title;
    END IF;
  END IF;
  
  -- For updates, sync the fields if one is changed
  IF TG_OP = 'UPDATE' THEN
    IF NEW.user_subject_id != OLD.user_subject_id AND NEW.user_subject_id IS NOT NULL THEN
      NEW.subject_id := NEW.user_subject_id;
    ELSIF NEW.subject_id != OLD.subject_id AND NEW.subject_id IS NOT NULL THEN
      NEW.user_subject_id := NEW.subject_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Function: generate_unique_referral_code
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code(base_code text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  base text;
  suffix text;
  full_code text;
  attempt int := 0;
BEGIN
  -- sanitize and trim base to 8 chars
  base := UPPER(LEFT(COALESCE(regexp_replace(base_code, '[^a-zA-Z0-9]', '', 'g'), ''), 8));

  -- fallback base if none
  IF base = '' THEN
    base := UPPER(SUBSTRING(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 6));
  END IF;

  LOOP
    IF attempt = 0 THEN
      suffix := '';
    ELSE
      suffix := LPAD(attempt::text, 2, '0');
    END IF;

    full_code := base || suffix;

    -- unique across profiles
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = full_code) THEN
      RETURN full_code;
    END IF;

    attempt := attempt + 1;

    -- hard fallback to a random 8-char code after 99 attempts
    IF attempt > 99 THEN
      full_code := UPPER(SUBSTRING(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 8));
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = full_code) THEN
        RETURN full_code;
      END IF;
      -- keep trying if extremely unlucky
      attempt := 0;
      base := UPPER(SUBSTRING(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 6));
    END IF;
  END LOOP;
END;
$function$;
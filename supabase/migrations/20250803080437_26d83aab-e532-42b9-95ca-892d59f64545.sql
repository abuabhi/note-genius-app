-- Fix the update_session_quality function to handle NULL values properly
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
    NEW.session_quality := calculate_session_quality(
      COALESCE(NEW.duration, 0),
      COALESCE(NEW.cards_reviewed, 0),
      COALESCE(NEW.cards_correct, 0),
      COALESCE(NEW.quiz_score, 0),
      COALESCE(NEW.quiz_total_questions, 0)
    );
  END IF;
  
  RETURN NEW;
END;
$function$
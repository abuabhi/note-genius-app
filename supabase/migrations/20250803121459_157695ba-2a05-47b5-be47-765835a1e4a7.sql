-- Fix the trigger function to use fully qualified function name
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

-- Clean up the stuck session for the current user
UPDATE public.study_sessions 
SET 
  is_active = false,
  end_time = NOW(),
  duration = EXTRACT(EPOCH FROM (NOW() - start_time))::INTEGER,
  notes = COALESCE(notes, '') || ' (Auto-closed due to technical issue)'
WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef' 
  AND is_active = true;
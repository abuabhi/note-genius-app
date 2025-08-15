
-- Phase 1: Clean up all existing study sessions to start fresh
DELETE FROM study_sessions;

-- Phase 2: Add study_plan_id column to associate sessions with specific study plans
ALTER TABLE study_sessions 
ADD COLUMN study_plan_id uuid REFERENCES study_plans(id) ON DELETE SET NULL;

-- Phase 3: Remove the problematic 4-hour duration cap trigger
DROP TRIGGER IF EXISTS validate_session_duration_trigger ON study_sessions;
DROP FUNCTION IF EXISTS validate_session_duration();

-- Create a new, more reasonable session validation function
CREATE OR REPLACE FUNCTION validate_session_duration()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Cap duration at 12 hours maximum (more reasonable for study sessions)
  IF NEW.duration IS NOT NULL AND NEW.duration > 43200 THEN
    NEW.duration := 43200;
  END IF;
  
  -- If ending an active session, calculate realistic duration
  IF OLD.is_active = true AND NEW.is_active = false AND NEW.duration IS NULL THEN
    NEW.duration := LEAST(
      EXTRACT(EPOCH FROM (COALESCE(NEW.end_time, NOW()) - NEW.start_time))::INTEGER,
      43200
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger with the updated function
CREATE TRIGGER validate_session_duration_trigger
  BEFORE UPDATE ON study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION validate_session_duration();

-- Add index for better performance when querying by study_plan_id
CREATE INDEX IF NOT EXISTS idx_study_sessions_study_plan_id ON study_sessions(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_study_plan ON study_sessions(user_id, study_plan_id);

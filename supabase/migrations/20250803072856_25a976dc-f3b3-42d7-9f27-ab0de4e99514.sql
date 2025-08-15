-- Phase 1: Fix Quiz Subject Mapping Issues
-- Add logging function for better debugging
CREATE OR REPLACE FUNCTION public.log_quiz_creation_debug(
  quiz_data jsonb,
  context text DEFAULT 'quiz_creation'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Log quiz creation for debugging (can be removed later)
  RAISE LOG 'QUIZ_DEBUG [%]: %', context, quiz_data::text;
END;
$$;

-- Add validation trigger to prevent NULL user_subject_id in new quizzes
CREATE OR REPLACE FUNCTION public.validate_quiz_subject_mapping()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  -- Log the quiz data being inserted/updated
  PERFORM log_quiz_creation_debug(
    jsonb_build_object(
      'operation', TG_OP,
      'user_subject_id', NEW.user_subject_id,
      'subject_id', NEW.subject_id,
      'title', NEW.title,
      'source_type', NEW.source_type
    ),
    'validation_trigger'
  );

  -- For new quizzes, require either user_subject_id or ensure we have subject_id
  IF TG_OP = 'INSERT' THEN
    -- If user_subject_id is NULL but we have subject_id, sync them
    IF NEW.user_subject_id IS NULL AND NEW.subject_id IS NOT NULL THEN
      NEW.user_subject_id := NEW.subject_id;
      RAISE LOG 'QUIZ_VALIDATION: Synced user_subject_id from subject_id for quiz: %', NEW.title;
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
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS validate_quiz_subject_mapping_trigger ON public.quizzes;
CREATE TRIGGER validate_quiz_subject_mapping_trigger
  BEFORE INSERT OR UPDATE ON public.quizzes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_quiz_subject_mapping();

-- Add indexes for better performance on subject lookups
CREATE INDEX IF NOT EXISTS idx_quizzes_user_subject_id ON public.quizzes(user_subject_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id_subject ON public.quizzes(user_id, user_subject_id);
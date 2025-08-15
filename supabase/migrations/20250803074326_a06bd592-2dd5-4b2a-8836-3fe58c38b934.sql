-- Fix quiz creation by removing problematic logging from validation trigger
CREATE OR REPLACE FUNCTION public.validate_quiz_subject_mapping()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
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
$$;
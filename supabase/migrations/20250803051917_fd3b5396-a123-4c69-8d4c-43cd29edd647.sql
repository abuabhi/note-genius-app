-- Step 1: Drop the academic_subjects table (it's empty and unused)
DROP TABLE IF EXISTS public.academic_subjects CASCADE;

-- Step 2: Add user_subject_id column to quizzes table to properly reference user_subjects
ALTER TABLE public.quizzes 
ADD COLUMN user_subject_id UUID REFERENCES public.user_subjects(id);

-- Step 3: Create index for performance on the new foreign key
CREATE INDEX idx_quizzes_user_subject_id ON public.quizzes(user_subject_id);

-- Step 4: Update any existing quizzes to set user_subject_id based on subject_id if there's a match
-- (This is safe since we're keeping subject_id for now)

-- Step 5: Add comment for clarity
COMMENT ON COLUMN public.quizzes.user_subject_id IS 'References user_subjects table for user-defined subjects';
COMMENT ON COLUMN public.quizzes.subject_id IS 'Legacy column - kept for backward compatibility, use user_subject_id instead';
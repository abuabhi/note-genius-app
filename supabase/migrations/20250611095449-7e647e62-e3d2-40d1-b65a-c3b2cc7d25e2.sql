
-- Migrate all content from "Technologies" to "Technology"
UPDATE notes SET subject = 'Technology' WHERE subject = 'Technologies';
UPDATE flashcard_sets SET subject = 'Technology' WHERE subject = 'Technologies';
UPDATE user_subjects SET name = 'Technology' WHERE name = 'Technologies';
UPDATE study_goals SET subject = 'Technology' WHERE subject = 'Technologies';
UPDATE quizzes SET education_system = 'Technology' WHERE education_system = 'Technologies';
UPDATE events SET title = REPLACE(title, 'Technologies', 'Technology') WHERE title LIKE '%Technologies%';
UPDATE study_sessions SET subject = 'Technology' WHERE subject = 'Technologies';

-- Add any other tables that might reference the subject
UPDATE profiles SET adaptive_learning_preferences = 
  jsonb_set(
    adaptive_learning_preferences, 
    '{subjects}', 
    (
      SELECT jsonb_agg(
        CASE 
          WHEN value = '"Technologies"' THEN '"Technology"'
          ELSE value
        END
      )
      FROM jsonb_array_elements(adaptive_learning_preferences->'subjects')
    )
  )
WHERE adaptive_learning_preferences ? 'subjects' 
AND adaptive_learning_preferences->'subjects' @> '["Technologies"]';

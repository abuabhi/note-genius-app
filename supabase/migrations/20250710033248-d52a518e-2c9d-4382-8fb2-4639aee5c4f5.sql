-- Update grade_level enum to include grades 5 to PhD
-- First, create a new enum with the updated values
CREATE TYPE grade_level_new AS ENUM (
  'Grade 5',
  'Grade 6', 
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Undergraduate',
  'Graduate',
  'PhD'
);

-- Update the profiles table to use the new enum
ALTER TABLE profiles 
ALTER COLUMN grade TYPE grade_level_new 
USING grade::text::grade_level_new;

-- Drop the old enum and rename the new one
DROP TYPE grade_level;
ALTER TYPE grade_level_new RENAME TO grade_level;
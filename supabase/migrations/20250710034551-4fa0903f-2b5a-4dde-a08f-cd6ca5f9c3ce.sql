-- Update the existing grade_level enum to change 'PhD' to 'Post Graduate'
-- First drop the existing enum and recreate it
ALTER TYPE grade_level RENAME TO grade_level_old;

-- Create new enum with corrected value
CREATE TYPE grade_level AS ENUM (
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
  'Post Graduate'
);

-- Update any existing data and change column type
UPDATE profiles 
SET grade = 'Post Graduate'::text 
WHERE grade::text = 'PhD';

-- Update the profiles table to use the new enum
ALTER TABLE profiles 
ALTER COLUMN grade TYPE grade_level 
USING CASE 
  WHEN grade::text = 'PhD' THEN 'Post Graduate'::grade_level
  ELSE grade::text::grade_level
END;

-- Drop the old enum
DROP TYPE grade_level_old;
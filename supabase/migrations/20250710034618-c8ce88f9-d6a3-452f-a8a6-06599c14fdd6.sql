-- Update the existing grade_level enum to change 'PhD' to 'Post Graduate'
-- Create a temporary column to handle the migration
ALTER TABLE profiles ADD COLUMN grade_temp text;

-- Copy current values as text, updating PhD to Post Graduate
UPDATE profiles 
SET grade_temp = CASE 
  WHEN grade::text = 'PhD' THEN 'Post Graduate'
  ELSE grade::text
END;

-- Drop the old grade column
ALTER TABLE profiles DROP COLUMN grade;

-- Recreate the enum with the corrected values
DROP TYPE grade_level;
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

-- Add the grade column back with new enum type
ALTER TABLE profiles ADD COLUMN grade grade_level;

-- Copy the corrected values back
UPDATE profiles 
SET grade = grade_temp::grade_level;

-- Drop the temporary column
ALTER TABLE profiles DROP COLUMN grade_temp;
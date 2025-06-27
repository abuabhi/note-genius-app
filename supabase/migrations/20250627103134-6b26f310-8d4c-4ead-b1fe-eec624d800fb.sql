
-- Clean up corrupt study sessions with unrealistic durations
DELETE FROM study_sessions 
WHERE duration > 28800 OR duration < 0; -- Remove sessions longer than 8 hours or negative

-- Also clean up any sessions with unrealistic time ranges
DELETE FROM study_sessions 
WHERE end_time IS NOT NULL 
AND start_time IS NOT NULL 
AND EXTRACT(EPOCH FROM (end_time - start_time)) > 28800; -- More than 8 hours

-- Update any remaining sessions with NULL durations to calculate realistic ones
UPDATE study_sessions 
SET duration = LEAST(
  EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time))::INTEGER,
  28800
)
WHERE duration IS NULL AND end_time IS NOT NULL;

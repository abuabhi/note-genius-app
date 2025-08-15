-- Force reset questions_status and add timestamp to track when it was reset
UPDATE notes 
SET questions_status = 'pending',
    updated_at = NOW()
WHERE id = '5911ab81-168b-4ebe-919a-fb4071cd2b59';
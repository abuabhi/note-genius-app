-- Reset the stuck key_points_status to failed so user can retry
UPDATE notes 
SET key_points_status = 'failed',
    updated_at = now()
WHERE id = 'c051ddbe-c2ba-4e0f-b464-38dfd22e3bea' 
AND key_points_status = 'generating';
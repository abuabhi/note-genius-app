-- Reset stuck 'generating' status to 'pending' for the current note
UPDATE notes 
SET questions_status = 'pending',
    summary_status = CASE WHEN summary_status = 'generating' THEN 'pending' ELSE summary_status END,
    key_points_status = CASE WHEN key_points_status = 'generating' THEN 'pending' ELSE key_points_status END,
    markdown_content_status = CASE WHEN markdown_content_status = 'generating' THEN 'pending' ELSE markdown_content_status END,
    enriched_status = CASE WHEN enriched_status = 'generating' THEN 'pending' ELSE enriched_status END
WHERE id = '5911ab81-168b-4ebe-919a-fb4071cd2b59';
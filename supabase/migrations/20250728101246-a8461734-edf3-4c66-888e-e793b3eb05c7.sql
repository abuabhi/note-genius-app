-- Reset stuck statuses for the specific note that was having issues
UPDATE notes 
SET summary_status = 'failed',
    key_points_status = 'failed',
    questions_status = 'failed',
    markdown_content_status = 'failed',
    enriched_status = 'failed',
    updated_at = now()
WHERE id = 'bc46c804-d76f-4a21-8dae-6cd1070d666c' 
AND (summary_status = 'generating' OR key_points_status = 'generating' OR questions_status = 'generating' OR markdown_content_status = 'generating' OR enriched_status = 'generating');
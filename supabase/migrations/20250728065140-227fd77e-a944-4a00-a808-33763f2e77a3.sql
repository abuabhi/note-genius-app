-- Reset stuck statuses for the specific note that was having issues
UPDATE notes 
SET summary_status = 'failed',
    key_points_status = 'failed',
    questions_status = 'failed',
    markdown_content_status = 'failed',
    enriched_status = 'failed',
    updated_at = now()
WHERE id = 'a445a24c-f455-42ad-b610-2ff5cdaacacf' 
AND (summary_status = 'generating' OR key_points_status = 'generating' OR questions_status = 'generating' OR markdown_content_status = 'generating' OR enriched_status = 'generating');
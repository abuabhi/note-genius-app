-- Reset all stuck enhancement statuses for note 1923fa8f-6181-4b9c-841e-208ac5037ba5
UPDATE notes 
SET summary_status = 'pending',
    key_points_status = 'pending', 
    markdown_content_status = 'pending',
    questions_status = 'pending',
    enriched_status = 'pending',
    updated_at = NOW()
WHERE id = '1923fa8f-6181-4b9c-841e-208ac5037ba5';
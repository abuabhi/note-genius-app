-- Remove duplicate "Note Organisation" topics that have no content
DELETE FROM public.help_topics 
WHERE id IN (
  'bfdf701d-d777-4180-950a-580e7516d586', -- Note Organisation, priority 4
  '5b1d7edc-6e72-43b3-9277-c2bfd7fa3908'  -- Note Organization, priority 9
);

-- Update remaining help topics to have sequential priorities starting from 1
-- First, let's get the current topics and renumber them based on creation order
WITH ranked_topics AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as new_priority
  FROM public.help_topics
  WHERE is_active = true
)
UPDATE public.help_topics 
SET priority = ranked_topics.new_priority
FROM ranked_topics 
WHERE help_topics.id = ranked_topics.id;
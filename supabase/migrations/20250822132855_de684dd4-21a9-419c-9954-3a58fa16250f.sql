-- Add set_id column to flashcards table to link flashcards to their sets
ALTER TABLE public.flashcards 
ADD COLUMN set_id uuid REFERENCES public.flashcard_sets(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_flashcards_set_id ON public.flashcards(set_id);

-- Update existing flashcards to link them to existing sets
-- For demonstration, we'll assign flashcards to the first available set for each user
WITH user_sets AS (
  SELECT DISTINCT 
    fs.user_id,
    fs.id as set_id,
    ROW_NUMBER() OVER (PARTITION BY fs.user_id ORDER BY fs.created_at) as rn
  FROM public.flashcard_sets fs
),
default_sets AS (
  SELECT user_id, set_id
  FROM user_sets 
  WHERE rn = 1
)
UPDATE public.flashcards 
SET set_id = ds.set_id
FROM default_sets ds
WHERE flashcards.user_id = ds.user_id 
AND flashcards.set_id IS NULL;

-- For any remaining orphaned flashcards, create a default set
INSERT INTO public.flashcard_sets (name, description, user_id, subject, created_at, updated_at)
SELECT 
  'Default Flashcard Set' as name,
  'Auto-created set for existing flashcards' as description,
  f.user_id,
  'General' as subject,
  now() as created_at,
  now() as updated_at
FROM public.flashcards f
LEFT JOIN public.flashcard_sets fs ON fs.user_id = f.user_id
WHERE f.set_id IS NULL 
AND f.user_id IS NOT NULL
AND fs.id IS NULL
GROUP BY f.user_id;

-- Link remaining orphaned flashcards to the default set
WITH default_sets_for_orphans AS (
  SELECT 
    fs.id as set_id,
    fs.user_id
  FROM public.flashcard_sets fs
  WHERE fs.name = 'Default Flashcard Set'
)
UPDATE public.flashcards 
SET set_id = dso.set_id
FROM default_sets_for_orphans dso
WHERE flashcards.user_id = dso.user_id 
AND flashcards.set_id IS NULL;
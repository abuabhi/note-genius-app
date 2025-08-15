-- Clean up any existing "Scanned Documents" subjects
DELETE FROM public.user_subjects 
WHERE name IN ('Scanned Documents', 'scanned documents');
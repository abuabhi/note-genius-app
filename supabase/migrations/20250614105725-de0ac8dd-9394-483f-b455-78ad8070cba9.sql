
-- First, restore the user to DEAN tier and clean up conflicting subscription data
UPDATE public.profiles 
SET user_tier = 'DEAN'::user_tier,
    updated_at = now()
WHERE id = auth.uid();

-- Clean up any conflicting subscription records that might be causing the downgrade
DELETE FROM public.subscribers 
WHERE user_id = auth.uid();

-- If auth.uid() doesn't work in migration context, target the most recent user
UPDATE public.profiles 
SET user_tier = 'DEAN'::user_tier,
    updated_at = now()
WHERE id = (
  SELECT id 
  FROM public.profiles 
  ORDER BY created_at DESC 
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE user_tier = 'DEAN'::user_tier
);

-- Clean up subscriber records for the most recent user as well
DELETE FROM public.subscribers 
WHERE user_id = (
  SELECT id 
  FROM public.profiles 
  ORDER BY created_at DESC 
  LIMIT 1
);

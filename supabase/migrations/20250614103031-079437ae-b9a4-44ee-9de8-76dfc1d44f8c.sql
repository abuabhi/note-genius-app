
-- First, let's check if there's a subscribers table that might be interfering
-- and update the user profile directly to DEAN tier
UPDATE public.profiles 
SET user_tier = 'DEAN'::user_tier,
    updated_at = now()
WHERE id = auth.uid();

-- If there's no current user context, update the most recent profile
-- This is a fallback in case the auth.uid() doesn't work in migration context
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

-- Clean up any conflicting subscription records if they exist
UPDATE public.subscribers 
SET subscribed = false,
    subscription_tier = NULL,
    updated_at = now()
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE user_tier = 'DEAN'::user_tier
)
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscribers');

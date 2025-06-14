
-- Update the user's tier to DEAN in the profiles table
-- This assumes you're the only user or you want to update the most recent user
-- If you need to target a specific user, we can modify this query

UPDATE public.profiles 
SET user_tier = 'DEAN'::user_tier,
    updated_at = now()
WHERE id = (
  SELECT id 
  FROM public.profiles 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Optionally, if there are any subscription records, we can clean those up
-- since DEAN tier users don't need active subscriptions
UPDATE public.subscribers 
SET subscribed = false,
    subscription_tier = NULL,
    updated_at = now()
WHERE user_id = (
  SELECT id 
  FROM public.profiles 
  ORDER BY created_at DESC 
  LIMIT 1
);

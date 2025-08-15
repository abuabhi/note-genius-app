-- Tighten RLS on subscribers to prevent access by email and restrict to account owner only
-- Safely drop existing permissive policies if they exist
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Ensure RLS is enabled
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Restrict read to the authenticated account owner by user_id only
CREATE POLICY "Users can view their own subscription (by user_id)"
ON public.subscribers
FOR SELECT
USING (user_id = auth.uid());

-- Allow users to insert only their own row (edge functions with service role bypass RLS)
CREATE POLICY "Users can insert their own subscriber row"
ON public.subscribers
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow users to update only their own row
CREATE POLICY "Users can update their own subscription (by user_id)"
ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid());

-- Do NOT create a DELETE policy so users cannot delete subscriber records
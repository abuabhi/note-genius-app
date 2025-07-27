-- CRITICAL SECURITY FIXES: Prevent Privilege Escalation
-- Phase 1: Fix privilege escalation vulnerability in profiles table

-- Drop existing UPDATE policy for profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new restricted UPDATE policy that prevents user_tier modifications
CREATE POLICY "Users can update own profile (restricted)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent users from modifying their own user_tier
  user_tier = (SELECT user_tier FROM public.profiles WHERE id = auth.uid())
);

-- Create secure admin-only function for tier updates
CREATE OR REPLACE FUNCTION public.update_user_tier(
  target_user_id UUID,
  new_tier user_tier,
  reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  old_tier user_tier;
  admin_user_id UUID;
BEGIN
  -- Verify caller is DEAN tier
  admin_user_id := auth.uid();
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = admin_user_id AND user_tier = 'DEAN'
  ) THEN
    RAISE EXCEPTION 'Access denied: Only DEAN users can update user tiers';
  END IF;
  
  -- Get current tier for audit
  SELECT user_tier INTO old_tier 
  FROM public.profiles 
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Prevent DEAN users from demoting themselves
  IF target_user_id = admin_user_id AND new_tier != 'DEAN' THEN
    RAISE EXCEPTION 'DEAN users cannot demote themselves';
  END IF;
  
  -- Update the tier
  UPDATE public.profiles 
  SET user_tier = new_tier, updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Log the change in audit table
  INSERT INTO public.influencer_promotions_audit (
    user_id,
    promoted_by,
    from_tier,
    to_tier,
    promotion_type,
    notes
  ) VALUES (
    target_user_id,
    admin_user_id,
    old_tier::text,
    new_tier::text,
    'admin_update',
    COALESCE(reason, 'Administrative tier update')
  );
  
  RETURN TRUE;
END;
$$;

-- Grant execute permission to authenticated users (function handles authorization internally)
GRANT EXECUTE ON FUNCTION public.update_user_tier(UUID, user_tier, TEXT) TO authenticated;
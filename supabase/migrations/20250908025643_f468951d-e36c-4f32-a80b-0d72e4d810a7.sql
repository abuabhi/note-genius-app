-- CRITICAL SECURITY FIX: Implement strict RLS policies for sensitive data tables
-- This fixes the vulnerability where customer payment data could be stolen

-- Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_payouts ENABLE ROW LEVEL SECURITY;

-- Force RLS (cannot be bypassed even by table owners)
ALTER TABLE public.subscribers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.referrals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_coupons FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_payouts FORCE ROW LEVEL SECURITY;

-- Revoke all public access to sensitive tables
REVOKE ALL ON public.subscribers FROM anon, public;
REVOKE ALL ON public.contact_submissions FROM anon, public;
REVOKE ALL ON public.coupon_usage FROM anon, public;
REVOKE ALL ON public.influencer_orders FROM anon, public;
REVOKE ALL ON public.referrals FROM anon, public;
REVOKE ALL ON public.influencer_coupons FROM anon, public;
REVOKE ALL ON public.influencer_payouts FROM anon, public;

-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Subscribers user access" ON public.subscribers;
DROP POLICY IF EXISTS "Users can manage their own subscription" ON public.subscribers;

-- Create secure RLS policies for subscribers table
CREATE POLICY "subscribers_secure_user_access" 
ON public.subscribers 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Secure contact submissions - only DEAN tier can access
CREATE POLICY "contact_submissions_dean_only" 
ON public.contact_submissions 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- Secure coupon usage - only owners and DEANs
CREATE POLICY "coupon_usage_secure_access" 
ON public.coupon_usage 
FOR ALL 
TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- Secure influencer orders - only owners and DEANs
CREATE POLICY "influencer_orders_secure_access" 
ON public.influencer_orders 
FOR ALL 
TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- Secure referrals - only involved users and DEANs
CREATE POLICY "referrals_secure_access" 
ON public.referrals 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = referrer_id OR 
  auth.uid() = referred_user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- Secure influencer coupons - only owners and DEANs
CREATE POLICY "influencer_coupons_secure_access" 
ON public.influencer_coupons 
FOR ALL 
TO authenticated
USING (
  auth.uid() = influencer_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  auth.uid() = influencer_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- Secure influencer payouts - only owners and DEANs
CREATE POLICY "influencer_payouts_secure_access" 
ON public.influencer_payouts 
FOR ALL 
TO authenticated
USING (
  auth.uid() = influencer_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  auth.uid() = influencer_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- Add security audit logging for sensitive operations
CREATE OR REPLACE FUNCTION log_sensitive_access_enhanced()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    success,
    error_message
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    true,
    'Sensitive data access logged'
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
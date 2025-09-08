-- CRITICAL SECURITY FIX: Lock down sensitive tables with proper RLS
-- Fix vulnerability where customer payment data could be stolen

-- Enable and FORCE RLS on all sensitive tables
ALTER TABLE public.subscribers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.referrals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_coupons FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_payouts FORCE ROW LEVEL SECURITY;

-- REVOKE ALL public access to prevent data theft
REVOKE ALL ON public.subscribers FROM anon, public;
REVOKE ALL ON public.contact_submissions FROM anon, public;
REVOKE ALL ON public.coupon_usage FROM anon, public;
REVOKE ALL ON public.influencer_orders FROM anon, public;
REVOKE ALL ON public.referrals FROM anon, public;
REVOKE ALL ON public.influencer_coupons FROM anon, public;
REVOKE ALL ON public.influencer_payouts FROM anon, public;

-- Clean up existing policies and create secure ones
DROP POLICY IF EXISTS "subscribers_secure_user_access" ON public.subscribers;
DROP POLICY IF EXISTS "contact_submissions_dean_only" ON public.contact_submissions;
DROP POLICY IF EXISTS "coupon_usage_secure_access" ON public.coupon_usage;
DROP POLICY IF EXISTS "influencer_orders_secure_access" ON public.influencer_orders;
DROP POLICY IF EXISTS "referrals_secure_access" ON public.referrals;
DROP POLICY IF EXISTS "influencer_coupons_secure_access" ON public.influencer_coupons;
DROP POLICY IF EXISTS "influencer_payouts_secure_access" ON public.influencer_payouts;

-- SECURE SUBSCRIBERS: Only users can access their own subscription data
CREATE POLICY "subscribers_secure_access" 
ON public.subscribers 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- SECURE CONTACT SUBMISSIONS: Only DEAN tier can access
CREATE POLICY "contact_secure_dean_only" 
ON public.contact_submissions 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- SECURE COUPON USAGE: Users can only access their own usage + DEANs
CREATE POLICY "coupon_usage_secure" 
ON public.coupon_usage 
FOR ALL 
TO authenticated
USING (
  auth.uid() = user_id OR 
  auth.uid() = influencer_id OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- SECURE INFLUENCER ORDERS: No customer_email exposure, only related users
CREATE POLICY "influencer_orders_secure" 
ON public.influencer_orders 
FOR ALL 
TO authenticated
USING (
  auth.uid() = influencer_id OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- SECURE REFERRALS: Only involved parties can see referral data
CREATE POLICY "referrals_secure" 
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

-- SECURE INFLUENCER COUPONS: Only owners and DEANs
CREATE POLICY "influencer_coupons_secure" 
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
);

-- SECURE INFLUENCER PAYOUTS: Only owners and DEANs
CREATE POLICY "influencer_payouts_secure" 
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
);
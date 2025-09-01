-- Fix RLS policies for security issues identified in security scan

-- 1. Fix subscribers table RLS - ensure only user can access their own data
DROP POLICY IF EXISTS "subscribers_user_strict_access" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_deny_anon" ON public.subscribers;

CREATE POLICY "subscribers_user_access_only" 
ON public.subscribers 
FOR ALL 
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 2. Fix contact_submissions table RLS - simplify and secure
DROP POLICY IF EXISTS "contact_dean_secure_access" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_public_insert_only" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_dean_delete_only" ON public.contact_submissions;
DROP POLICY IF EXISTS "DENY_ALL_anon_contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "DENY_ALL_public_contact_submissions" ON public.contact_submissions;

-- Allow public to submit contact forms
CREATE POLICY "contact_public_insert" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Only DEAN users can view and manage contact submissions
CREATE POLICY "contact_dean_full_access" 
ON public.contact_submissions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND user_tier = 'DEAN'
));

-- 3. Fix referrals table RLS - simplify access control
DROP POLICY IF EXISTS "referrals_secure_user_access" ON public.referrals;
DROP POLICY IF EXISTS "referrals_system_insert" ON public.referrals;
DROP POLICY IF EXISTS "referrals_system_update" ON public.referrals;
DROP POLICY IF EXISTS "DENY_ALL_anon_referrals" ON public.referrals;
DROP POLICY IF EXISTS "DENY_ALL_public_referrals" ON public.referrals;

-- Users can only view referrals they're involved in
CREATE POLICY "referrals_participant_access" 
ON public.referrals 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    auth.uid() = referrer_id OR 
    auth.uid() = referred_user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_tier = 'DEAN')
  )
);

-- System can insert and update referrals (for automated processing)
CREATE POLICY "referrals_system_write" 
ON public.referrals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "referrals_system_update" 
ON public.referrals 
FOR UPDATE 
USING (true);

-- 4. Create missing financial tables if they don't exist and secure them
CREATE TABLE IF NOT EXISTS public.influencer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL,
  user_id UUID NOT NULL,
  order_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.influencer_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL,
  payout_amount DECIMAL(10,2) NOT NULL,
  payout_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on financial tables
ALTER TABLE public.influencer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_payouts ENABLE ROW LEVEL SECURITY;

-- Secure financial tables - only DEAN users can access
CREATE POLICY "financial_dean_only_orders" 
ON public.influencer_orders 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND user_tier = 'DEAN'
));

CREATE POLICY "financial_dean_only_coupons" 
ON public.coupon_usage 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND user_tier = 'DEAN'
));

CREATE POLICY "financial_dean_only_payouts" 
ON public.influencer_payouts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND user_tier = 'DEAN'
));

-- Influencers can only view their own financial data
CREATE POLICY "influencer_own_orders" 
ON public.influencer_orders 
FOR SELECT 
USING (auth.uid() = influencer_id);

CREATE POLICY "influencer_own_payouts" 
ON public.influencer_payouts 
FOR SELECT 
USING (auth.uid() = influencer_id);
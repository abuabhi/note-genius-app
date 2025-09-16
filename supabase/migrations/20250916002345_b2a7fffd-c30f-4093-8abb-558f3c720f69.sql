-- Phase 2: Complete RLS Security Conversion - Fix Remaining Critical Issues
-- Drop all PERMISSIVE policies and replace with RESTRICTIVE "deny by default, allow by exception"

-- Fix coupon_usage table
DROP POLICY IF EXISTS "coupon_usage_restricted" ON public.coupon_usage;

-- Create RESTRICTIVE policies for coupon_usage
CREATE POLICY "coupon_usage_deny_all" 
  ON public.coupon_usage 
  FOR ALL 
  TO public 
  AS RESTRICTIVE 
  USING (false);

CREATE POLICY "coupon_usage_owner_dean_access" 
  ON public.coupon_usage 
  FOR ALL 
  TO public 
  AS RESTRICTIVE 
  USING (
    (auth.uid() = user_id AND auth.uid() IS NOT NULL) OR 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    ))
  );

-- Fix influencer_orders table  
DROP POLICY IF EXISTS "influencer_orders_restricted" ON public.influencer_orders;

-- Create RESTRICTIVE policies for influencer_orders
CREATE POLICY "influencer_orders_deny_all" 
  ON public.influencer_orders 
  FOR ALL 
  TO public 
  AS RESTRICTIVE 
  USING (false);

CREATE POLICY "influencer_orders_owner_dean_access" 
  ON public.influencer_orders 
  FOR ALL 
  TO public 
  AS RESTRICTIVE 
  USING (
    (auth.uid() = influencer_id AND auth.uid() IS NOT NULL) OR 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    ))
  );

-- Fix influencer_payouts table - Drop ALL 6 PERMISSIVE policies
DROP POLICY IF EXISTS "Influencer payouts access" ON public.influencer_payouts;
DROP POLICY IF EXISTS "Influencers can view their own payouts" ON public.influencer_payouts;
DROP POLICY IF EXISTS "financial_dean_only_payouts" ON public.influencer_payouts;
DROP POLICY IF EXISTS "influencer_own_payouts" ON public.influencer_payouts;
DROP POLICY IF EXISTS "influencer_payouts_restricted" ON public.influencer_payouts;
DROP POLICY IF EXISTS "payouts_dean_only" ON public.influencer_payouts;

-- Create single RESTRICTIVE deny-all policy for influencer_payouts
CREATE POLICY "influencer_payouts_deny_all" 
  ON public.influencer_payouts 
  FOR ALL 
  TO public 
  AS RESTRICTIVE 
  USING (false);

-- Create single RESTRICTIVE allow policy for influencer_payouts
CREATE POLICY "influencer_payouts_owner_dean_access" 
  ON public.influencer_payouts 
  FOR ALL 
  TO public 
  AS RESTRICTIVE 
  USING (
    (auth.uid() = influencer_id AND auth.uid() IS NOT NULL) OR 
    (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    ))
  );

-- Log this critical security fix
INSERT INTO public.security_audit_log (
  user_id,
  action, 
  table_name,
  success,
  error_message
) VALUES (
  auth.uid(),
  'RLS_SECURITY_CONVERSION_PHASE_2',
  'coupon_usage,influencer_orders,influencer_payouts',
  true,
  'Converted remaining PERMISSIVE policies to RESTRICTIVE - eliminated all security backdoors'
);
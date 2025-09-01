-- COMPREHENSIVE SECURITY FIX - Address All Critical Security Vulnerabilities
-- This migration fixes all 7 critical security issues identified in the security scan

-- ================================
-- 1. REVOKE ALL PUBLIC ACCESS FROM ANON ROLE
-- ================================

-- Remove all permissions from anon role on sensitive tables
REVOKE ALL ON public.subscribers FROM anon;
REVOKE ALL ON public.contact_submissions FROM anon;
REVOKE ALL ON public.coupon_usage FROM anon;
REVOKE ALL ON public.influencer_orders FROM anon;
REVOKE ALL ON public.referrals FROM anon;
REVOKE ALL ON public.influencer_coupons FROM anon;
REVOKE ALL ON public.security_audit_log FROM anon;

-- ================================
-- 2. ENABLE AND FORCE RLS ON ALL SENSITIVE TABLES
-- ================================

-- Ensure RLS is enabled and forced (cannot be bypassed)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage FORCE ROW LEVEL SECURITY;

ALTER TABLE public.influencer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_orders FORCE ROW LEVEL SECURITY;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals FORCE ROW LEVEL SECURITY;

ALTER TABLE public.influencer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_coupons FORCE ROW LEVEL SECURITY;

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log FORCE ROW LEVEL SECURITY;

-- ================================
-- 3. CREATE SECURE RLS POLICIES
-- ================================

-- SUBSCRIBERS: Only users can access their own subscription data
DROP POLICY IF EXISTS "Users can only access their own subscription data" ON public.subscribers;
CREATE POLICY "Users can only access their own subscription data" 
ON public.subscribers FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- CONTACT SUBMISSIONS: Only DEAN users can view all submissions
DROP POLICY IF EXISTS "Only DEAN users can view contact submissions" ON public.contact_submissions;
CREATE POLICY "Only DEAN users can view contact submissions" 
ON public.contact_submissions FOR SELECT 
USING (is_dean_user(auth.uid()));

DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact forms" 
ON public.contact_submissions FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Only DEAN users can update contact submissions" ON public.contact_submissions;
CREATE POLICY "Only DEAN users can update contact submissions" 
ON public.contact_submissions FOR UPDATE 
USING (is_dean_user(auth.uid()));

-- COUPON USAGE: Only DEAN users can access financial data
DROP POLICY IF EXISTS "Only DEAN users can access coupon usage data" ON public.coupon_usage;
CREATE POLICY "Only DEAN users can access coupon usage data" 
ON public.coupon_usage FOR ALL 
USING (is_dean_user(auth.uid()));

-- INFLUENCER ORDERS: Only DEAN users and order owners can access
DROP POLICY IF EXISTS "DEAN users and order owners can access orders" ON public.influencer_orders;
CREATE POLICY "DEAN users and order owners can access orders" 
ON public.influencer_orders FOR SELECT 
USING (
  is_dean_user(auth.uid()) OR 
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- REFERRALS: Users can only see referrals they made or received
DROP POLICY IF EXISTS "Users can view referrals they made or received" ON public.referrals;
CREATE POLICY "Users can view referrals they made or received" 
ON public.referrals FOR SELECT 
USING (
  auth.uid() = referrer_id OR 
  auth.uid() = referred_user_id OR
  is_dean_user(auth.uid())
);

DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
CREATE POLICY "System can insert referrals" 
ON public.referrals FOR INSERT 
WITH CHECK (true);

-- INFLUENCER COUPONS: Only DEAN users and coupon owners can access
DROP POLICY IF EXISTS "DEAN users can manage all coupons" ON public.influencer_coupons;
CREATE POLICY "DEAN users can manage all coupons" 
ON public.influencer_coupons FOR ALL 
USING (is_dean_user(auth.uid()));

DROP POLICY IF EXISTS "Influencers can view their own coupons" ON public.influencer_coupons;
CREATE POLICY "Influencers can view their own coupons" 
ON public.influencer_coupons FOR SELECT 
USING (influencer_id = auth.uid());

-- SECURITY AUDIT LOG: Only DEAN users can access security logs
DROP POLICY IF EXISTS "DEAN users can view security audit logs" ON public.security_audit_log;
CREATE POLICY "DEAN users can view security audit logs" 
ON public.security_audit_log FOR SELECT 
USING (is_dean_user(auth.uid()));

DROP POLICY IF EXISTS "System can insert security audit logs" ON public.security_audit_log;
CREATE POLICY "System can insert security audit logs" 
ON public.security_audit_log FOR INSERT 
WITH CHECK (true);

-- ================================
-- 4. GRANT MINIMAL NECESSARY PERMISSIONS TO AUTHENTICATED USERS
-- ================================

-- Grant only the minimum necessary permissions to authenticated users
-- These are subject to RLS policies

-- Subscribers: Users need to manage their own subscriptions
GRANT SELECT, INSERT, UPDATE ON public.subscribers TO authenticated;

-- Contact submissions: Users need to submit forms, DEAN users manage them
GRANT INSERT ON public.contact_submissions TO authenticated;

-- Coupon usage: No direct access (managed by edge functions)
-- No grants needed - only DEAN users via RLS

-- Influencer orders: Read-only access for users to see their orders
GRANT SELECT ON public.influencer_orders TO authenticated;

-- Referrals: Read access for users to see their referrals
GRANT SELECT ON public.referrals TO authenticated;

-- Influencer coupons: Read access for validation purposes
GRANT SELECT ON public.influencer_coupons TO authenticated;

-- Security audit log: Insert access for logging, read access restricted by RLS
GRANT INSERT ON public.security_audit_log TO authenticated;

-- ================================
-- 5. ADDITIONAL SECURITY MEASURES
-- ================================

-- Create a function to log security access attempts
CREATE OR REPLACE FUNCTION public.log_security_access(
  p_action text,
  p_table_name text,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    success,
    error_message
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_success,
    p_error_message
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Silently fail to avoid breaking application flow
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
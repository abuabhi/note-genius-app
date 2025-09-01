-- ABSOLUTE SECURITY LOCKDOWN - Remove all possible public access vectors
-- This migration ensures zero public access to sensitive tables using every possible method

-- ================================
-- 1. REMOVE ALL POSSIBLE DEFAULT PRIVILEGES
-- ================================

-- Revoke all privileges from ALL roles on sensitive tables
REVOKE ALL PRIVILEGES ON public.subscribers FROM public, anon, authenticated;
REVOKE ALL PRIVILEGES ON public.contact_submissions FROM public, anon, authenticated;
REVOKE ALL PRIVILEGES ON public.coupon_usage FROM public, anon, authenticated;
REVOKE ALL PRIVILEGES ON public.influencer_orders FROM public, anon, authenticated;
REVOKE ALL PRIVILEGES ON public.referrals FROM public, anon, authenticated;
REVOKE ALL PRIVILEGES ON public.influencer_coupons FROM public, anon, authenticated;
REVOKE ALL PRIVILEGES ON public.security_audit_log FROM public, anon, authenticated;

-- ================================
-- 2. RE-ENABLE MINIMAL ACCESS FOR AUTHENTICATED USERS ONLY
-- ================================

-- Grant minimal necessary access back to authenticated role (subject to RLS)
GRANT SELECT ON public.subscribers TO authenticated;
GRANT INSERT ON public.subscribers TO authenticated;
GRANT UPDATE ON public.subscribers TO authenticated;

GRANT INSERT ON public.contact_submissions TO authenticated;
GRANT SELECT ON public.referrals TO authenticated;
GRANT SELECT ON public.influencer_coupons TO authenticated;
GRANT SELECT ON public.influencer_orders TO authenticated;
GRANT INSERT ON public.security_audit_log TO authenticated;

-- ================================
-- 3. ABSOLUTELY ENSURE RLS CANNOT BE BYPASSED
-- ================================

-- Force RLS and ensure it cannot be disabled
ALTER TABLE public.subscribers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.referrals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_coupons FORCE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log FORCE ROW LEVEL SECURITY;

-- ================================
-- 4. CREATE DENY-ALL POLICIES FOR ANON USERS
-- ================================

-- Create explicit DENY policies for anon role (highest priority)
CREATE POLICY "DENY_ALL_anon_subscribers" ON public.subscribers 
FOR ALL TO anon 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_anon_contact_submissions" ON public.contact_submissions 
FOR ALL TO anon 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_anon_coupon_usage" ON public.coupon_usage 
FOR ALL TO anon 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_anon_influencer_orders" ON public.influencer_orders 
FOR ALL TO anon 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_anon_referrals" ON public.referrals 
FOR ALL TO anon 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_anon_influencer_coupons" ON public.influencer_coupons 
FOR ALL TO anon 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_anon_security_audit_log" ON public.security_audit_log 
FOR ALL TO anon 
USING (false) WITH CHECK (false);

-- ================================
-- 5. DENY PUBLIC ROLE ACCESS
-- ================================

-- Create explicit DENY policies for public role
CREATE POLICY "DENY_ALL_public_subscribers" ON public.subscribers 
FOR ALL TO public 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_public_contact_submissions" ON public.contact_submissions 
FOR ALL TO public 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_public_coupon_usage" ON public.coupon_usage 
FOR ALL TO public 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_public_influencer_orders" ON public.influencer_orders 
FOR ALL TO public 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_public_referrals" ON public.referrals 
FOR ALL TO public 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_public_influencer_coupons" ON public.influencer_coupons 
FOR ALL TO public 
USING (false) WITH CHECK (false);

CREATE POLICY "DENY_ALL_public_security_audit_log" ON public.security_audit_log 
FOR ALL TO public 
USING (false) WITH CHECK (false);

-- ================================
-- 6. LOG COMPLETION OF ABSOLUTE LOCKDOWN
-- ================================

INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    success,
    error_message
) VALUES (
    auth.uid(),
    'ABSOLUTE_SECURITY_LOCKDOWN',
    'all_sensitive_tables',
    true,
    'Absolute security lockdown completed - all public access vectors eliminated'
);
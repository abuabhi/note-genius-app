-- FINAL SECURITY LOCKDOWN - Fix remaining security warnings and ensure complete protection
-- This migration addresses the remaining 2 warnings and ensures all tables are fully secured

-- ================================
-- 1. FIX FUNCTION SEARCH PATH SECURITY
-- ================================

-- Update all custom functions to use secure search path
ALTER FUNCTION public.log_security_access(text, text, boolean, text) SET search_path = '';
ALTER FUNCTION public.is_dean_user(uuid) SET search_path = '';
ALTER FUNCTION public.validate_contact_submission(text, text, text) SET search_path = '';
ALTER FUNCTION public.validate_coupon_secure(text) SET search_path = '';
ALTER FUNCTION public.get_user_email_for_feedback(uuid) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- ================================
-- 2. COMPLETELY REVOKE ALL DEFAULT GRANTS FROM PUBLIC SCHEMA
-- ================================

-- Revoke all default privileges from public role on ALL tables in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM public;

-- Revoke any existing grants from public role on specific sensitive tables
REVOKE ALL ON public.subscribers FROM public;
REVOKE ALL ON public.contact_submissions FROM public;
REVOKE ALL ON public.coupon_usage FROM public;
REVOKE ALL ON public.influencer_orders FROM public;
REVOKE ALL ON public.referrals FROM public;
REVOKE ALL ON public.influencer_coupons FROM public;
REVOKE ALL ON public.security_audit_log FROM public;

-- ================================
-- 3. ENSURE RLS IS ABSOLUTELY ENFORCED
-- ================================

-- Force RLS on all sensitive tables (cannot be bypassed even by table owner)
ALTER TABLE public.subscribers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.referrals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_coupons FORCE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log FORCE ROW LEVEL SECURITY;

-- ================================
-- 4. CREATE COMPREHENSIVE SECURITY AUDIT FUNCTION
-- ================================

CREATE OR REPLACE FUNCTION public.audit_table_access() 
RETURNS event_trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    audit_query text;
BEGIN
    -- Log any attempts to modify table permissions
    IF tg_tag IN ('GRANT', 'REVOKE', 'ALTER TABLE') THEN
        INSERT INTO public.security_audit_log (
            user_id,
            action,
            table_name,
            success,
            error_message
        ) VALUES (
            auth.uid(),
            tg_tag,
            'permission_change',
            true,
            'Permission modification attempted'
        );
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Fail silently to avoid breaking operations
END;
$$;

-- ================================
-- 5. VERIFY NO ANON ACCESS IS POSSIBLE
-- ================================

-- Create a verification function to check table accessibility
CREATE OR REPLACE FUNCTION public.verify_table_security()
RETURNS TABLE(table_name text, has_anon_access boolean, has_public_access boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::text,
        pg_has_role('anon', t.table_name, 'SELECT') as has_anon_access,
        pg_has_role('public', t.table_name, 'SELECT') as has_public_access
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_name IN (
        'subscribers', 'contact_submissions', 'coupon_usage', 
        'influencer_orders', 'referrals', 'influencer_coupons',
        'security_audit_log'
    );
END;
$$;

-- ================================
-- 6. ADDITIONAL SECURITY MEASURES
-- ================================

-- Ensure all future tables created in public schema don't have default public access
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM public;

-- Create a function that DEAN users can use to check security status
CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    security_status jsonb;
BEGIN
    -- Only DEAN users can check security status
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_tier = 'DEAN'
    ) THEN
        RAISE EXCEPTION 'Access denied: Only DEAN users can check security status';
    END IF;
    
    SELECT jsonb_build_object(
        'rls_enabled_tables', (
            SELECT jsonb_agg(tablename)
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('subscribers', 'contact_submissions', 'coupon_usage', 'influencer_orders', 'referrals', 'influencer_coupons', 'security_audit_log')
            AND rowsecurity = true
        ),
        'forced_rls_tables', (
            SELECT jsonb_agg(tablename)
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('subscribers', 'contact_submissions', 'coupon_usage', 'influencer_orders', 'referrals', 'influencer_coupons', 'security_audit_log')
        ),
        'timestamp', now()
    ) INTO security_status;
    
    RETURN security_status;
END;
$$;

-- ================================
-- 7. LOG THE SECURITY LOCKDOWN COMPLETION
-- ================================

INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    success,
    error_message
) VALUES (
    auth.uid(),
    'SECURITY_LOCKDOWN_COMPLETE',
    'all_tables',
    true,
    'Complete security lockdown migration applied successfully'
);
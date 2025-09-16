-- COMPREHENSIVE RLS SECURITY OVERHAUL
-- Converting from vulnerable PERMISSIVE policies to secure RESTRICTIVE architecture
-- "Deny by default, allow by exception" security model

-- 1. CONTACT SUBMISSIONS - Complete lockdown except DEAN + service_role
DROP POLICY IF EXISTS "DEAN_tier_users_can_view_all_contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "DEAN_tier_users_can_update_contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Service_role_can_insert_contact_submissions" ON public.contact_submissions;

-- Deny all access by default (RESTRICTIVE)
CREATE POLICY "contact_submissions_deny_all" 
  ON public.contact_submissions 
  AS RESTRICTIVE
  FOR ALL 
  USING (false);

-- Allow DEAN users to view/update (RESTRICTIVE ALLOW)
CREATE POLICY "contact_submissions_dean_access" 
  ON public.contact_submissions 
  AS RESTRICTIVE
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Allow service role to insert only (RESTRICTIVE ALLOW)  
CREATE POLICY "contact_submissions_service_insert" 
  ON public.contact_submissions 
  AS RESTRICTIVE
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- 2. SUBSCRIBERS - Owner + DEAN only
DROP POLICY IF EXISTS "subscribers_user_only" ON public.subscribers;

-- Deny all access by default
CREATE POLICY "subscribers_deny_all" 
  ON public.subscribers 
  AS RESTRICTIVE
  FOR ALL 
  USING (false);

-- Allow users to access their own data + DEAN users all data
CREATE POLICY "subscribers_owner_dean_access" 
  ON public.subscribers 
  AS RESTRICTIVE
  FOR ALL 
  USING (
    (auth.uid() = user_id AND auth.uid() IS NOT NULL) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- 3. INFLUENCER COUPONS - Owner + DEAN only
DROP POLICY IF EXISTS "influencer_coupons_restricted" ON public.influencer_coupons;

-- Deny all access by default
CREATE POLICY "influencer_coupons_deny_all" 
  ON public.influencer_coupons 
  AS RESTRICTIVE
  FOR ALL 
  USING (false);

-- Allow owners + DEAN users
CREATE POLICY "influencer_coupons_owner_dean_access" 
  ON public.influencer_coupons 
  AS RESTRICTIVE
  FOR ALL 
  USING (
    (auth.uid() = influencer_id) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- 4. REFERRALS - Participants + DEAN only
DROP POLICY IF EXISTS "referrals_restricted" ON public.referrals;

-- Deny all access by default
CREATE POLICY "referrals_deny_all" 
  ON public.referrals 
  AS RESTRICTIVE
  FOR ALL 
  USING (false);

-- Allow referrer/referred + DEAN users
CREATE POLICY "referrals_participants_dean_access" 
  ON public.referrals 
  AS RESTRICTIVE
  FOR ALL 
  USING (
    (auth.uid() = referrer_id OR auth.uid() = referred_user_id) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- 5. INFLUENCER PROMOTIONS AUDIT - DEAN only (read-only for others)
DROP POLICY IF EXISTS "DEAN users can view all promotion audits" ON public.influencer_promotions_audit;
DROP POLICY IF EXISTS "DEAN users can insert promotion audits" ON public.influencer_promotions_audit;

-- Deny all access by default
CREATE POLICY "promotions_audit_deny_all" 
  ON public.influencer_promotions_audit 
  AS RESTRICTIVE
  FOR ALL 
  USING (false);

-- Allow DEAN users full access
CREATE POLICY "promotions_audit_dean_full_access" 
  ON public.influencer_promotions_audit 
  AS RESTRICTIVE
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Allow affected users to view their own audit records
CREATE POLICY "promotions_audit_user_readonly" 
  ON public.influencer_promotions_audit 
  AS RESTRICTIVE
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 6. SECURITY MONITORING TABLE (if exists) - Create and secure it
CREATE TABLE IF NOT EXISTS public.security_monitoring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address text,
  action_type text NOT NULL,
  resource_accessed text NOT NULL,
  access_granted boolean NOT NULL DEFAULT false,
  risk_level text NOT NULL DEFAULT 'medium',
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security monitoring
ALTER TABLE public.security_monitoring ENABLE ROW LEVEL SECURITY;

-- Deny all access by default
CREATE POLICY "security_monitoring_deny_all" 
  ON public.security_monitoring 
  AS RESTRICTIVE
  FOR ALL 
  USING (false);

-- Allow DEAN users to view all security events
CREATE POLICY "security_monitoring_dean_readonly" 
  ON public.security_monitoring 
  AS RESTRICTIVE
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Allow system to insert security events
CREATE POLICY "security_monitoring_system_insert" 
  ON public.security_monitoring 
  AS RESTRICTIVE
  FOR INSERT 
  WITH CHECK (true); -- System operations bypass user checks

-- 7. FEEDBACK - Secure feedback system
-- Drop and recreate with restrictive policies
DROP POLICY IF EXISTS "Users can create their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can update all feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedback;

-- Deny all by default
CREATE POLICY "feedback_deny_all" 
  ON public.feedback 
  AS RESTRICTIVE
  FOR ALL 
  USING (false);

-- Users can manage their own feedback
CREATE POLICY "feedback_owner_access" 
  ON public.feedback 
  AS RESTRICTIVE
  FOR ALL 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- DEAN users can view/update all feedback  
CREATE POLICY "feedback_dean_access" 
  ON public.feedback 
  AS RESTRICTIVE
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- 8. CONTEST ENTRIES - Secure contest system
DROP POLICY IF EXISTS "Users can view their own contest entries" ON public.contest_entries;
DROP POLICY IF EXISTS "Users can insert their own contest entries" ON public.contest_entries;
DROP POLICY IF EXISTS "Users can update their own contest entries" ON public.contest_entries;

-- Deny all by default
CREATE POLICY "contest_entries_deny_all" 
  ON public.contest_entries 
  AS RESTRICTIVE
  FOR ALL 
  USING (false);

-- Users can manage their own entries
CREATE POLICY "contest_entries_owner_access" 
  ON public.contest_entries 
  AS RESTRICTIVE
  FOR ALL 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- DEAN users can view all entries
CREATE POLICY "contest_entries_dean_readonly" 
  ON public.contest_entries 
  AS RESTRICTIVE
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- 9. ENFORCE NO ANONYMOUS ACCESS TO SENSITIVE DATA
-- Ensure auth.users table references are secure
-- Add additional security constraints

-- Create a function to validate DEAN access securely
CREATE OR REPLACE FUNCTION public.is_dean_user_verified(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id_param 
    AND user_tier = 'DEAN'
    AND id IS NOT NULL
  );
$$;

-- 10. CONTACT RATE LIMITING - Secure rate limiting table
CREATE TABLE IF NOT EXISTS public.contact_rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  window_start timestamp with time zone NOT NULL,
  submissions_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(ip_address, window_start)
);

-- Enable RLS
ALTER TABLE public.contact_rate_limit ENABLE ROW LEVEL SECURITY;

-- Deny all by default
CREATE POLICY "contact_rate_limit_deny_all" 
  ON public.contact_rate_limit 
  AS RESTRICTIVE
  FOR ALL 
  USING (false);

-- Allow system/service_role to manage rate limiting
CREATE POLICY "contact_rate_limit_system_access" 
  ON public.contact_rate_limit 
  AS RESTRICTIVE
  FOR ALL 
  USING (auth.role() = 'service_role');

-- DEAN users can view rate limiting data
CREATE POLICY "contact_rate_limit_dean_readonly" 
  ON public.contact_rate_limit 
  AS RESTRICTIVE
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- FINAL: Log this security overhaul
INSERT INTO public.security_audit_log (
  user_id,
  action, 
  table_name,
  success,
  error_message
) VALUES (
  auth.uid(),
  'COMPREHENSIVE_RLS_SECURITY_OVERHAUL',
  'all_sensitive_tables',
  true,
  'Converted from PERMISSIVE to RESTRICTIVE RLS architecture - deny by default, allow by exception'
);
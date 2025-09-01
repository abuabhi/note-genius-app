-- Phase 2A: Enhanced Security Policies and Audit System
-- This migration implements required security hardening for all sensitive data

-- Enhanced RLS policies for subscriber billing data
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with enhanced security
DROP POLICY IF EXISTS "subscribers_user_access_only" ON public.subscribers;
DROP POLICY IF EXISTS "DENY_ALL_anon_subscribers" ON public.subscribers;  
DROP POLICY IF EXISTS "DENY_ALL_public_subscribers" ON public.subscribers;

-- Recreate with enhanced security and audit logging
CREATE POLICY "subscribers_user_strict_access" ON public.subscribers
FOR ALL USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL 
  AND (SELECT log_security_access('subscriber_access', 'subscribers', true)) IS NOT NULL
);

CREATE POLICY "subscribers_deny_anon" ON public.subscribers
FOR ALL USING (false) WITH CHECK (false);

-- Enhanced RLS for influencer financial data
DROP POLICY IF EXISTS "coupons_dean_full_access" ON public.influencer_coupons;
DROP POLICY IF EXISTS "coupons_owner_read_only" ON public.influencer_coupons;

CREATE POLICY "coupons_dean_audited_access" ON public.influencer_coupons
FOR ALL USING (
  is_dean_user(auth.uid()) 
  AND (SELECT log_security_access('coupon_access', 'influencer_coupons', true)) IS NOT NULL
);

CREATE POLICY "coupons_owner_restricted_read" ON public.influencer_coupons
FOR SELECT USING (
  auth.uid() = influencer_id 
  AND auth.uid() IS NOT NULL
  AND (SELECT log_security_access('coupon_owner_access', 'influencer_coupons', true)) IS NOT NULL
);

-- Enhanced contact submission security
DROP POLICY IF EXISTS "contact_dean_read_only" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_dean_modify_only" ON public.contact_submissions;

CREATE POLICY "contact_dean_secure_access" ON public.contact_submissions
FOR ALL USING (
  is_dean_user(auth.uid())
  AND (SELECT log_security_access('contact_admin_access', 'contact_submissions', true)) IS NOT NULL
);

-- Secure referral code access with enhanced restrictions
DROP POLICY IF EXISTS "referrals_user_and_dean_access" ON public.referrals;

CREATE POLICY "referrals_secure_user_access" ON public.referrals
FOR SELECT USING (
  (auth.uid() = referrer_id OR auth.uid() = referred_user_id OR is_dean_user(auth.uid()))
  AND auth.uid() IS NOT NULL
  AND (SELECT log_security_access('referral_access', 'referrals', true)) IS NOT NULL
);

-- Create security monitoring table for real-time tracking
CREATE TABLE IF NOT EXISTS public.security_monitoring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ip_address text,
  user_agent text,
  action_type text NOT NULL,
  resource_accessed text NOT NULL,
  access_granted boolean NOT NULL DEFAULT false,
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security monitoring
ALTER TABLE public.security_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "security_monitoring_dean_only" ON public.security_monitoring
FOR ALL USING (is_dean_user(auth.uid()));

-- Create session security table for enhanced access control
CREATE TABLE IF NOT EXISTS public.user_sessions_security (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL,
  ip_address text,
  user_agent text,
  last_activity timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  failed_attempts integer DEFAULT 0,
  locked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on session security
ALTER TABLE public.user_sessions_security ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_security_user_only" ON public.user_sessions_security
FOR ALL USING (auth.uid() = user_id);

-- Create rate limiting table for admin operations
CREATE TABLE IF NOT EXISTS public.admin_rate_limiting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  last_request_at timestamp with time zone DEFAULT now(),
  is_blocked boolean DEFAULT false,
  block_expires_at timestamp with time zone
);

-- Enable RLS on rate limiting
ALTER TABLE public.admin_rate_limiting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limiting_dean_only" ON public.admin_rate_limiting
FOR ALL USING (is_dean_user(auth.uid()));

-- Enhanced audit triggers for sensitive operations
CREATE OR REPLACE FUNCTION public.enhanced_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  risk_level text := 'medium';
  client_ip text;
BEGIN
  -- Get client IP from current request
  client_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
  
  -- Determine risk level based on operation and table
  IF TG_TABLE_NAME IN ('subscribers', 'influencer_coupons') THEN
    risk_level := 'high';
  ELSIF TG_OP = 'DELETE' THEN
    risk_level := 'critical';
  END IF;
  
  -- Log to security monitoring
  INSERT INTO public.security_monitoring (
    user_id,
    ip_address,
    action_type,
    resource_accessed,
    access_granted,
    risk_level,
    metadata
  ) VALUES (
    auth.uid(),
    client_ip,
    TG_OP,
    TG_TABLE_NAME,
    true,
    risk_level,
    jsonb_build_object(
      'timestamp', now(),
      'table', TG_TABLE_NAME,
      'operation', TG_OP
    )
  );
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply enhanced audit triggers to sensitive tables
DROP TRIGGER IF EXISTS enhanced_audit_subscribers ON public.subscribers;
CREATE TRIGGER enhanced_audit_subscribers
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_trigger();

DROP TRIGGER IF EXISTS enhanced_audit_coupons ON public.influencer_coupons;
CREATE TRIGGER enhanced_audit_coupons
  AFTER INSERT OR UPDATE OR DELETE ON public.influencer_coupons
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_trigger();

DROP TRIGGER IF EXISTS enhanced_audit_contacts ON public.contact_submissions;
CREATE TRIGGER enhanced_audit_contacts
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_trigger();

DROP TRIGGER IF EXISTS enhanced_audit_referrals ON public.referrals;
CREATE TRIGGER enhanced_audit_referrals
  AFTER INSERT OR UPDATE OR DELETE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_audit_trigger();

-- Create function for real-time security monitoring
CREATE OR REPLACE FUNCTION public.get_security_alerts()
RETURNS TABLE(
  alert_id uuid,
  alert_type text,
  severity text,
  message text,
  user_email text,
  created_at timestamp with time zone,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id as alert_id,
    sm.action_type as alert_type,
    sm.risk_level as severity,
    CASE 
      WHEN sm.risk_level = 'critical' THEN 'Critical security event detected'
      WHEN sm.risk_level = 'high' THEN 'High-risk security activity'
      ELSE 'Security monitoring alert'
    END as message,
    COALESCE(au.email, 'Unknown') as user_email,
    sm.created_at,
    sm.metadata
  FROM public.security_monitoring sm
  LEFT JOIN auth.users au ON au.id = sm.user_id
  WHERE sm.created_at >= (now() - INTERVAL '24 hours')
    AND sm.risk_level IN ('high', 'critical')
  ORDER BY sm.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for session security management
CREATE OR REPLACE FUNCTION public.check_session_security(p_user_id uuid, p_ip_address text)
RETURNS jsonb AS $$
DECLARE
  session_count integer;
  failed_attempts integer;
  is_locked boolean := false;
  result jsonb;
BEGIN
  -- Check for too many active sessions
  SELECT COUNT(*) INTO session_count
  FROM public.user_sessions_security
  WHERE user_id = p_user_id 
    AND is_active = true 
    AND expires_at > now();
  
  -- Check failed attempts
  SELECT COALESCE(SUM(failed_attempts), 0) INTO failed_attempts
  FROM public.user_sessions_security
  WHERE user_id = p_user_id 
    AND created_at >= (now() - INTERVAL '1 hour');
  
  -- Check if user is locked
  SELECT EXISTS(
    SELECT 1 FROM public.user_sessions_security
    WHERE user_id = p_user_id 
      AND locked_until > now()
  ) INTO is_locked;
  
  result := jsonb_build_object(
    'session_count', session_count,
    'failed_attempts', failed_attempts,
    'is_locked', is_locked,
    'max_sessions_allowed', 5,
    'security_status', CASE 
      WHEN is_locked THEN 'locked'
      WHEN failed_attempts > 10 THEN 'high_risk'
      WHEN session_count > 3 THEN 'suspicious'
      ELSE 'normal'
    END
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_monitoring_user_time ON public.security_monitoring(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_monitoring_risk_time ON public.security_monitoring(risk_level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_security_user_active ON public.user_sessions_security(user_id, is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_rate_limiting_user_action ON public.admin_rate_limiting(user_id, action_type, window_start);
-- CRITICAL SECURITY LOCKDOWN - Final Fix for All Remaining Issues
-- Ensure no public access to sensitive tables for anon role

-- Completely revoke all permissions from anon role on all sensitive tables
REVOKE ALL ON public.subscribers FROM anon;
REVOKE ALL ON public.contact_submissions FROM anon;
REVOKE ALL ON public.influencer_coupons FROM anon;
REVOKE ALL ON public.coupon_usage FROM anon;
REVOKE ALL ON public.influencer_orders FROM anon;

-- Double-check RLS is enabled and forced on all sensitive tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.influencer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_coupons FORCE ROW LEVEL SECURITY;

ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage FORCE ROW LEVEL SECURITY;

ALTER TABLE public.influencer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_orders FORCE ROW LEVEL SECURITY;

-- Ensure only minimal necessary permissions for authenticated users
-- Subscribers: only SELECT/INSERT/UPDATE (no DELETE)
GRANT SELECT, INSERT, UPDATE ON public.subscribers TO authenticated;

-- Contact submissions: only INSERT for public, SELECT/UPDATE for DEAN
GRANT INSERT ON public.contact_submissions TO authenticated;

-- Influencer coupons: only SELECT for authenticated users (for validation)
GRANT SELECT ON public.influencer_coupons TO authenticated;

-- Coupon usage: only SELECT for authenticated users
GRANT SELECT ON public.coupon_usage TO authenticated;

-- Influencer orders: only SELECT for authenticated users
GRANT SELECT ON public.influencer_orders TO authenticated;

-- Create a comprehensive security audit log for tracking access attempts
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  ip_address text,
  user_agent text,
  attempted_at timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  error_message text
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only DEAN users can view audit logs
CREATE POLICY "DEAN users can view security audit logs" 
ON public.security_audit_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  )
);

-- System can insert audit log entries
CREATE POLICY "System can insert security audit logs" 
ON public.security_audit_log FOR INSERT 
WITH CHECK (true);

-- Revoke all permissions from anon on audit log
REVOKE ALL ON public.security_audit_log FROM anon;

-- Grant only SELECT to authenticated users (subject to RLS)
GRANT SELECT, INSERT ON public.security_audit_log TO authenticated;
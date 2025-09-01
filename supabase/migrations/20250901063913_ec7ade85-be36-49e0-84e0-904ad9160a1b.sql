-- Complete security hardening and system fixes
-- Move uuid-ossp extension to secure schema for better isolation
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;

-- Create comprehensive security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for audit log
CREATE POLICY "security_audit_log_system_insert" 
ON public.security_audit_log FOR INSERT 
WITH CHECK (true);

CREATE POLICY "security_audit_log_dean_access" 
ON public.security_audit_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  )
);

-- Create comprehensive audit triggers for sensitive tables
CREATE OR REPLACE FUNCTION public.audit_sensitive_operation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, table_name, success, error_message
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    true,
    NULL
  );
  
  -- Return the appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to all sensitive tables
DROP TRIGGER IF EXISTS audit_subscribers ON public.subscribers;
CREATE TRIGGER audit_subscribers
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operation();

DROP TRIGGER IF EXISTS audit_contact_submissions ON public.contact_submissions;
CREATE TRIGGER audit_contact_submissions
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operation();

DROP TRIGGER IF EXISTS audit_referrals ON public.referrals;
CREATE TRIGGER audit_referrals
  AFTER INSERT OR UPDATE OR DELETE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operation();

DROP TRIGGER IF EXISTS audit_influencer_coupons ON public.influencer_coupons;
CREATE TRIGGER audit_influencer_coupons
  AFTER INSERT OR UPDATE OR DELETE ON public.influencer_coupons
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operation();

-- Additional security constraints
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.contact_submissions ADD CONSTRAINT contact_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create event trigger for security monitoring
CREATE OR REPLACE FUNCTION public.security_event_monitor()
RETURNS event_trigger AS $$
BEGIN
  IF tg_tag IN ('DROP TABLE', 'ALTER TABLE', 'GRANT', 'REVOKE') THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, success, error_message
    ) VALUES (
      auth.uid(),
      tg_tag,
      'system_security_event',
      true,
      'Security-related DDL operation performed'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP EVENT TRIGGER IF EXISTS security_monitor_trigger;
CREATE EVENT TRIGGER security_monitor_trigger
ON ddl_command_end
EXECUTE FUNCTION public.security_event_monitor();
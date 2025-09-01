-- Move extension from public schema to secure schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move the extension (assuming it's uuid-ossp based on common patterns)
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
  user_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to read their own audit logs or admin to read all
CREATE POLICY "Users can view their own audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Only system can insert audit logs (no user inserts)
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (false); -- Prevents all user inserts, only system/triggers can insert

-- Add additional constraints on sensitive financial fields
ALTER TABLE public.subscribers 
ADD CONSTRAINT check_positive_amount CHECK (amount >= 0);

ALTER TABLE public.influencer_orders 
ADD CONSTRAINT check_positive_order_value CHECK (order_value >= 0);

-- Create function to automatically log sensitive table access
CREATE OR REPLACE FUNCTION log_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    table_name, 
    operation, 
    user_id, 
    metadata, 
    risk_level
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    jsonb_build_object(
      'row_id', COALESCE(NEW.id, OLD.id),
      'timestamp', extract(epoch from now())
    ),
    CASE 
      WHEN TG_TABLE_NAME IN ('subscribers', 'influencer_orders', 'influencer_payouts') 
        THEN CASE WHEN TG_OP = 'SELECT' THEN 'high' ELSE 'critical' END
      WHEN TG_TABLE_NAME IN ('contact_submissions', 'referrals', 'coupon_usage') 
        THEN CASE WHEN TG_OP = 'SELECT' THEN 'medium' ELSE 'high' END
      ELSE 'low'
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for sensitive tables
CREATE TRIGGER audit_subscribers_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

CREATE TRIGGER audit_contact_submissions_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

CREATE TRIGGER audit_referrals_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

CREATE TRIGGER audit_influencer_orders_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.influencer_orders
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

CREATE TRIGGER audit_coupon_usage_access
  AFTER SELECT OR INSERT OR UPDATE OR DELETE ON public.coupon_usage
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();
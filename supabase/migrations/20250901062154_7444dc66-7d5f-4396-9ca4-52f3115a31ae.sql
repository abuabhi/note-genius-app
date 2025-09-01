-- Fix the extension move and audit system
-- First, let's move the extension properly
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move the extension if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        DROP EXTENSION "uuid-ossp" CASCADE;
    END IF;
    
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
END$$;

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
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

-- Add additional constraints on sensitive financial fields
DO $$
BEGIN
    -- Add constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_positive_amount' 
        AND table_name = 'subscribers'
    ) THEN
        ALTER TABLE public.subscribers 
        ADD CONSTRAINT check_positive_amount CHECK (amount >= 0);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_positive_order_value' 
        AND table_name = 'influencer_orders'
    ) THEN
        ALTER TABLE public.influencer_orders 
        ADD CONSTRAINT check_positive_order_value CHECK (order_value >= 0);
    END IF;
END$$;

-- Create function to automatically log sensitive table access (excluding SELECT)
CREATE OR REPLACE FUNCTION log_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log INSERT, UPDATE, DELETE operations
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
        THEN 'critical'
      WHEN TG_TABLE_NAME IN ('contact_submissions', 'referrals', 'coupon_usage') 
        THEN 'high'
      ELSE 'medium'
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for sensitive tables (INSERT, UPDATE, DELETE only)
DROP TRIGGER IF EXISTS audit_subscribers_access ON public.subscribers;
CREATE TRIGGER audit_subscribers_access
  AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

DROP TRIGGER IF EXISTS audit_contact_submissions_access ON public.contact_submissions;
CREATE TRIGGER audit_contact_submissions_access
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

DROP TRIGGER IF EXISTS audit_referrals_access ON public.referrals;
CREATE TRIGGER audit_referrals_access
  AFTER INSERT OR UPDATE OR DELETE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

DROP TRIGGER IF EXISTS audit_influencer_orders_access ON public.influencer_orders;
CREATE TRIGGER audit_influencer_orders_access
  AFTER INSERT OR UPDATE OR DELETE ON public.influencer_orders
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

DROP TRIGGER IF EXISTS audit_coupon_usage_access ON public.coupon_usage;
CREATE TRIGGER audit_coupon_usage_access
  AFTER INSERT OR UPDATE OR DELETE ON public.coupon_usage
  FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();
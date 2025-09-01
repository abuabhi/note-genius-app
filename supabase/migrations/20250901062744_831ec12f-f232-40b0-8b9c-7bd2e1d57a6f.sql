-- Create security audit system (simplified version)
-- Move extension to secure schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move uuid-ossp extension safely
DO $$
BEGIN
    -- Only move if it exists in public schema
    IF EXISTS (
        SELECT 1 FROM pg_extension e
        JOIN pg_namespace n ON e.extnamespace = n.oid
        WHERE e.extname = 'uuid-ossp' AND n.nspname = 'public'
    ) THEN
        DROP EXTENSION "uuid-ossp";
        CREATE EXTENSION "uuid-ossp" SCHEMA extensions;
    ELSIF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
    ) THEN
        CREATE EXTENSION "uuid-ossp" SCHEMA extensions;
    END IF;
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

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.security_audit_log;
CREATE POLICY "Users can view their own audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all audit logs" ON public.security_audit_log;
CREATE POLICY "Admin can view all audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_tier = 'DEAN'
  )
);

-- Create audit function for sensitive operations
CREATE OR REPLACE FUNCTION log_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all data modification operations on sensitive tables
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
      'timestamp', extract(epoch from now()),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    ),
    CASE 
      -- Critical: Payment and financial data
      WHEN TG_TABLE_NAME IN ('subscribers', 'influencer_orders', 'influencer_payouts', 'coupon_usage') 
        THEN 'critical'
      -- High: Contact and referral data  
      WHEN TG_TABLE_NAME IN ('contact_submissions', 'referrals') 
        THEN 'high'
      -- Medium: Other sensitive operations
      ELSE 'medium'
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to existing sensitive tables (if they exist)
DO $$
DECLARE
  table_name TEXT;
  tables_to_audit TEXT[] := ARRAY[
    'subscribers', 'contact_submissions', 'referrals', 
    'influencer_orders', 'coupon_usage'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables_to_audit
  LOOP
    -- Check if table exists before creating trigger
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = table_name
    ) THEN
      -- Drop trigger if it exists
      EXECUTE format('DROP TRIGGER IF EXISTS audit_%s_access ON public.%I', table_name, table_name);
      
      -- Create audit trigger
      EXECUTE format(
        'CREATE TRIGGER audit_%s_access
         AFTER INSERT OR UPDATE OR DELETE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION log_sensitive_access()',
        table_name, table_name
      );
      
      RAISE NOTICE 'Audit trigger created for table: %', table_name;
    ELSE
      RAISE NOTICE 'Table % does not exist, skipping audit trigger', table_name;
    END IF;
  END LOOP;
END$$;
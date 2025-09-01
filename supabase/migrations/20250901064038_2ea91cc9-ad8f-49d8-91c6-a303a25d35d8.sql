-- Fix security warnings from linter
-- Add proper search_path settings to functions

-- Update audit_sensitive_operation function with proper search path
CREATE OR REPLACE FUNCTION public.audit_sensitive_operation()
RETURNS TRIGGER
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Update security_event_monitor function with proper search path
CREATE OR REPLACE FUNCTION public.security_event_monitor()
RETURNS event_trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Ensure extensions are in secure schema (should be handled by previous migration)
-- Check if uuid-ossp is still in public schema and move if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension e 
        JOIN pg_namespace n ON e.extnamespace = n.oid 
        WHERE e.extname = 'uuid-ossp' AND n.nspname = 'public'
    ) THEN
        ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
    END IF;
END;
$$;
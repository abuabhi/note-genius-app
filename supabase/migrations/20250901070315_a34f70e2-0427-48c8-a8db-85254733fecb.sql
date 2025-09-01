-- Fix security warnings from Phase 2A migration
-- This addresses the function search path and extension security issues

-- Fix function search path security for enhanced_audit_trigger
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix function search path security for get_security_alerts
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix function search path security for check_session_security
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create extensions schema if it doesn't exist and move remaining extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move any remaining public extensions to the secure extensions schema
-- This addresses the "Extension in Public" security warning
DO $$
DECLARE
    ext_record RECORD;
BEGIN
    -- Move extensions from public to extensions schema (except system ones)
    FOR ext_record IN 
        SELECT e.extname 
        FROM pg_extension e 
        JOIN pg_namespace n ON e.extnamespace = n.oid 
        WHERE n.nspname = 'public'
        AND e.extname NOT IN ('plpgsql') -- Keep plpgsql in public as required by Postgres
        AND e.extname != 'pg_net' -- pg_net is managed by Supabase, don't move it
    LOOP
        BEGIN
            EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext_record.extname);
            RAISE NOTICE 'Moved extension % from public to extensions schema', ext_record.extname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not move extension %: %', ext_record.extname, SQLERRM;
        END;
    END LOOP;
END;
$$;

-- Grant necessary permissions on extensions schema
GRANT USAGE ON SCHEMA extensions TO authenticator;
GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;

-- Verify security improvements
DO $$
DECLARE
    ext_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Count remaining extensions in public schema
    SELECT COUNT(*) INTO ext_count
    FROM pg_extension e 
    JOIN pg_namespace n ON e.extnamespace = n.oid 
    WHERE n.nspname = 'public'
    AND e.extname NOT IN ('plpgsql', 'pg_net'); -- Exclude system and Supabase-managed extensions
    
    -- Count functions without proper search_path
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('enhanced_audit_trigger', 'get_security_alerts', 'check_session_security')
    AND NOT (p.prosecdef AND 'search_path=' = ANY(string_to_array(p.proconfig[1], '=')));
    
    IF ext_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All moveable extensions have been secured';
    ELSE
        RAISE NOTICE 'INFO: % extensions remain in public schema (likely system-managed)', ext_count;
    END IF;
    
    IF function_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All critical security functions now have secure search_path';
    ELSE
        RAISE WARNING 'WARNING: % functions still lack secure search_path', function_count;
    END IF;
END;
$$;
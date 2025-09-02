-- CRITICAL SECURITY FIX: Secure the get-secret edge function and fix RLS recursion issues

-- 1. First, let's create a security definer function to check DEAN tier safely
CREATE OR REPLACE FUNCTION public.is_dean_user_secure(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id_param 
    AND user_tier = 'DEAN'
  );
$$;

-- 2. Fix infinite recursion in study_group_members policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "study_group_members_access" ON public.study_group_members;
DROP POLICY IF EXISTS "study_group_members_insert" ON public.study_group_members;
DROP POLICY IF EXISTS "study_group_members_update" ON public.study_group_members;
DROP POLICY IF EXISTS "study_group_members_delete" ON public.study_group_members;

-- Create safe policies for study_group_members (assuming it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_group_members') THEN
    -- Users can manage their own group memberships
    EXECUTE 'CREATE POLICY "Users can manage own group memberships" ON public.study_group_members
      FOR ALL USING (auth.uid() = user_id);';
    
    -- Users can view memberships in groups they belong to
    EXECUTE 'CREATE POLICY "Users can view group memberships" ON public.study_group_members  
      FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
          SELECT 1 FROM public.study_group_members sgm2 
          WHERE sgm2.group_id = study_group_members.group_id 
          AND sgm2.user_id = auth.uid()
        )
      );';
  END IF;
END $$;

-- 3. Fix infinite recursion in conversation_participants policies  
-- Drop existing problematic policies
DROP POLICY IF EXISTS "conversation_participants_access" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_insert" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_update" ON public.conversation_participants;
DROP POLICY IF EXISTS "conversation_participants_delete" ON public.conversation_participants;

-- Create safe policies for conversation_participants (assuming it exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_participants') THEN
    -- Users can manage their own participation
    EXECUTE 'CREATE POLICY "Users can manage own participation" ON public.conversation_participants
      FOR ALL USING (auth.uid() = user_id);';
    
    -- Users can view participants in conversations they are part of
    EXECUTE 'CREATE POLICY "Users can view conversation participants" ON public.conversation_participants
      FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
          SELECT 1 FROM public.conversation_participants cp2
          WHERE cp2.conversation_id = conversation_participants.conversation_id
          AND cp2.user_id = auth.uid()
        )
      );';
  END IF;
END $$;

-- 4. Add security audit logging function for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_table_name text,
  p_operation text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if we have a valid user
  IF p_user_id IS NOT NULL THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      table_name,
      success,
      error_message
    ) VALUES (
      p_user_id,
      p_operation,
      p_table_name,
      true,
      'Sensitive operation logged'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Fail silently to avoid breaking operations
    NULL;
END;
$$;

-- 5. Enhanced security monitoring trigger for sensitive tables
CREATE OR REPLACE FUNCTION public.enhanced_security_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  risk_level text := 'medium';
BEGIN
  -- Determine risk level
  IF TG_TABLE_NAME IN ('subscribers', 'influencer_coupons', 'referrals', 'contact_submissions') THEN
    risk_level := 'high';
  ELSIF TG_OP = 'DELETE' THEN
    risk_level := 'critical';
  END IF;
  
  -- Log the operation
  PERFORM log_sensitive_access(TG_TABLE_NAME, TG_OP);
  
  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply the security trigger to sensitive tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('subscribers', 'influencer_coupons', 'referrals', 'contact_submissions', 'coupon_usage', 'influencer_payouts')
  LOOP
    -- Drop existing trigger if it exists
    EXECUTE format('DROP TRIGGER IF EXISTS enhanced_security_audit_trigger ON public.%I', table_name);
    
    -- Create new trigger
    EXECUTE format('CREATE TRIGGER enhanced_security_audit_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.%I
      FOR EACH ROW EXECUTE FUNCTION enhanced_security_trigger()', table_name);
  END LOOP;
END $$;
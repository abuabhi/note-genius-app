-- Security Fix: Strengthen contact_submissions RLS policies
-- Issue: Fix the PERMISSIVE policy that may allow unintended access

-- Drop the existing potentially vulnerable policy
DROP POLICY IF EXISTS "contact_dean_only" ON public.contact_submissions;

-- Create separate, more secure policies for different operations

-- Only DEAN users can view contact submissions
CREATE POLICY "DEAN_tier_users_can_view_all_contact_submissions" 
  ON public.contact_submissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Only DEAN users can update contact submissions  
CREATE POLICY "DEAN_tier_users_can_update_contact_submissions" 
  ON public.contact_submissions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Allow service role to insert (for contact form submissions via Edge Function)
-- This is necessary for the contact form to work for anonymous users
CREATE POLICY "Service_role_can_insert_contact_submissions" 
  ON public.contact_submissions 
  FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- Add audit logging function for contact submissions access
CREATE OR REPLACE FUNCTION log_contact_submission_access()
RETURNS trigger AS $$
BEGIN
  -- Log access to sensitive contact data for INSERT, UPDATE, DELETE operations
  PERFORM log_sensitive_access('contact_submissions', TG_OP);
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger to audit INSERT, UPDATE, DELETE operations on contact submissions
DROP TRIGGER IF EXISTS audit_contact_submissions ON public.contact_submissions;
CREATE TRIGGER audit_contact_submissions
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION log_contact_submission_access();
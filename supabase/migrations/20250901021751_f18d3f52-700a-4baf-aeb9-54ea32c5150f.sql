-- Fix critical security vulnerability: Secure customer payment data in subscribers table
-- Ensure RLS is properly configured and no unauthorized access is possible

-- Revoke any potential unauthorized access from anon role on subscribers table
REVOKE ALL ON subscribers FROM anon;

-- Ensure only authenticated users can access subscription data
-- (they can only access their own records due to existing RLS policies)
GRANT SELECT, INSERT, UPDATE ON subscribers TO authenticated;

-- Ensure RLS is enabled and forced on subscribers table
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers FORCE ROW LEVEL SECURITY;

-- Verify user_id column is not nullable for security
-- (This ensures every subscription record is tied to a specific user)
ALTER TABLE subscribers ALTER COLUMN user_id SET NOT NULL;

-- Create additional security policy to ensure email matches authenticated user
-- This adds an extra layer of security for email-based access
CREATE POLICY "Users can only access subscriptions with their email" 
ON subscribers FOR SELECT 
USING (
  user_id = auth.uid() 
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Ensure all existing records have proper user_id (safety check)
-- This will fail safely if there are any orphaned records without user_id
DO $$
BEGIN
  -- Check if there are any records without user_id
  IF EXISTS (SELECT 1 FROM subscribers WHERE user_id IS NULL) THEN
    RAISE EXCEPTION 'Found subscriber records without user_id. Manual cleanup required.';
  END IF;
END $$;
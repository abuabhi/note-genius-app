-- Fix critical security vulnerability: Remove overly permissive default privileges
-- that allow unauthenticated users to bypass RLS policies

-- Revoke dangerous default privileges for anon role on tables
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin REVOKE ALL ON TABLES FROM anon;

-- Revoke dangerous default privileges for anon role on sequences
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin REVOKE ALL ON SEQUENCES FROM anon;

-- Revoke dangerous default privileges for anon role on functions
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE ALL ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin REVOKE ALL ON FUNCTIONS FROM anon;

-- Also ensure authenticated role doesn't have overly broad access by default
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE ALL ON TABLES FROM authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin REVOKE ALL ON TABLES FROM authenticated;

-- Set up secure default privileges for authenticated users only
-- Authenticated users can use sequences (needed for inserts with auto-generated IDs)
ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin GRANT USAGE ON SEQUENCES TO authenticated;

-- Authenticated users can execute functions (needed for RLS and app functionality)
ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin GRANT EXECUTE ON FUNCTIONS TO authenticated;

-- Revoke any existing broad table privileges from anon role on existing tables
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Grant minimal necessary privileges back to anon for specific use cases
-- Allow anon to insert into contact_submissions (for contact form)
GRANT INSERT ON contact_submissions TO anon;

-- Allow anon to use sequences only for tables they can insert into
GRANT USAGE ON SEQUENCE contact_submissions_id_seq TO anon;

-- Allow anon to execute specific functions they need (like auth functions)
-- Note: They already have access via the function default privileges we set above for authenticated
-- but we'll be more explicit about which functions anon can use
GRANT EXECUTE ON FUNCTION auth.uid() TO anon;
GRANT EXECUTE ON FUNCTION auth.jwt() TO anon;
-- Fix security vulnerability for contact_submissions and other sensitive tables
-- Focus on what we can control with available permissions

-- Revoke existing overly broad privileges from anon role on sensitive tables
REVOKE ALL ON contact_submissions FROM anon;
REVOKE ALL ON subscribers FROM anon;
REVOKE ALL ON influencer_coupons FROM anon;
REVOKE ALL ON referrals FROM anon;

-- Grant only the minimum necessary privileges to anon role
-- Allow anon to insert contact forms (this is the intended public functionality)
GRANT INSERT ON contact_submissions TO anon;

-- Ensure authenticated users have proper access to tables they own
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON influencer_coupons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON referrals TO authenticated;

-- Grant sequence usage for tables that anon can insert into
GRANT USAGE ON SEQUENCE contact_submissions_id_seq TO anon;

-- Ensure RLS is enabled on all sensitive tables (defensive measure)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (extra security)
ALTER TABLE contact_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE subscribers FORCE ROW LEVEL SECURITY;
ALTER TABLE influencer_coupons FORCE ROW LEVEL SECURITY;
ALTER TABLE referrals FORCE ROW LEVEL SECURITY;
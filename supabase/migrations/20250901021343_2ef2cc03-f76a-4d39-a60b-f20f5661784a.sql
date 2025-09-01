-- Fix critical security vulnerability: Remove unauthorized access to sensitive tables
-- Focus on revoking dangerous privileges from anon role

-- Revoke all privileges from anon role on sensitive tables containing PII
REVOKE ALL ON contact_submissions FROM anon;
REVOKE ALL ON subscribers FROM anon;
REVOKE ALL ON influencer_coupons FROM anon;
REVOKE ALL ON referrals FROM anon;

-- Grant only the minimum necessary privilege for contact forms
-- Allow anon users to submit contact forms (INSERT only)
GRANT INSERT ON contact_submissions TO anon;

-- Ensure authenticated users have proper access
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON influencer_coupons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON referrals TO authenticated;

-- Ensure RLS is enabled and forced on all sensitive tables
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions FORCE ROW LEVEL SECURITY;

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;  
ALTER TABLE subscribers FORCE ROW LEVEL SECURITY;

ALTER TABLE influencer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_coupons FORCE ROW LEVEL SECURITY;

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals FORCE ROW LEVEL SECURITY;
-- Ensure all financial tables have proper policies and no public access

-- Add missing policies for influencer_coupons (only had DENY policies)
CREATE POLICY "Influencer coupons access" 
  ON public.influencer_coupons 
  FOR SELECT 
  USING (
    auth.uid() = influencer_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Add missing policies for influencer_payouts
CREATE POLICY "Influencer payouts access" 
  ON public.influencer_payouts 
  FOR SELECT 
  USING (
    auth.uid() = influencer_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Ensure no public grants exist on these tables
REVOKE ALL ON public.subscribers FROM anon, public;
REVOKE ALL ON public.contact_submissions FROM anon, public;
REVOKE ALL ON public.influencer_orders FROM anon, public;
REVOKE ALL ON public.coupon_usage FROM anon, public;
REVOKE ALL ON public.referrals FROM anon, public;
REVOKE ALL ON public.influencer_coupons FROM anon, public;
REVOKE ALL ON public.influencer_payouts FROM anon, public;

-- Grant back only what's needed for RLS to work
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupon_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_coupons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_payouts TO authenticated;
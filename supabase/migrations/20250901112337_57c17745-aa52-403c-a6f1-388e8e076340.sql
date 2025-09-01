-- Drop all dangerous RLS policies that allow unrestricted access
DROP POLICY IF EXISTS "contact_public_insert" ON public.contact_submissions;
DROP POLICY IF EXISTS "System can insert coupon usage" ON public.coupon_usage;  
DROP POLICY IF EXISTS "System can insert orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "System can update orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "System can insert payouts" ON public.influencer_payouts;
DROP POLICY IF EXISTS "System can update payouts" ON public.influencer_payouts;
DROP POLICY IF EXISTS "referrals_system_update" ON public.referrals;
DROP POLICY IF EXISTS "referrals_system_write" ON public.referrals;

-- Create secure admin-only and user-owned access patterns

-- Contact submissions: DEAN admin access only
CREATE POLICY "DEAN users can manage contact submissions" 
  ON public.contact_submissions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Subscribers: user can only see their own data
CREATE POLICY "Users can manage their own subscription" 
  ON public.subscribers 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Influencer orders: DEAN admin access + influencer can see their own
CREATE POLICY "Influencers can view their own orders" 
  ON public.influencer_orders 
  FOR SELECT 
  USING (
    auth.uid() = influencer_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Coupon usage: DEAN admin access + influencer can see their own
CREATE POLICY "Influencers can view their own coupon usage" 
  ON public.coupon_usage 
  FOR SELECT 
  USING (
    auth.uid() = influencer_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Referrals: participant access only
CREATE POLICY "Users can view their own referrals" 
  ON public.referrals 
  FOR SELECT 
  USING (
    auth.uid() = referrer_id OR 
    auth.uid() = referred_user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );
-- Clean up ALL dangerous policies thoroughly
DROP POLICY IF EXISTS "System can insert coupon usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "System can insert influencer orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "System can insert orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "System can update orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "contact_public_insert" ON public.contact_submissions;

-- Drop duplicate/conflicting policies to clean up
DROP POLICY IF EXISTS "contact_dean_full_access" ON public.contact_submissions;
DROP POLICY IF EXISTS "DEAN users can view all coupon usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "DEAN users can view all orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "DEAN users can view all influencer orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "financial_dean_only_coupons" ON public.coupon_usage;
DROP POLICY IF EXISTS "financial_dean_only_orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "coupon_usage_dean_only" ON public.coupon_usage;
DROP POLICY IF EXISTS "influencer_orders_restricted_access" ON public.influencer_orders;
DROP POLICY IF EXISTS "referrals_participant_access" ON public.referrals;

-- Drop any other potentially problematic policies
DROP POLICY IF EXISTS "subscribers_user_access_only" ON public.subscribers;

-- Now create CLEAN, single policies for each table

-- Contact submissions: Only DEAN users can access
CREATE POLICY "Contact submissions admin only" 
  ON public.contact_submissions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Subscribers: Users can only see their own data
CREATE POLICY "Subscribers user access" 
  ON public.subscribers 
  FOR ALL 
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Influencer orders: Read-only for influencers and admin access for DEAN
CREATE POLICY "Influencer orders access" 
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

-- Coupon usage: Read-only for influencers and admin access for DEAN  
CREATE POLICY "Coupon usage access" 
  ON public.coupon_usage 
  FOR SELECT 
  USING (
    auth.uid() = influencer_id OR
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Referrals: Read-only for participants and admin access for DEAN
CREATE POLICY "Referrals access" 
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
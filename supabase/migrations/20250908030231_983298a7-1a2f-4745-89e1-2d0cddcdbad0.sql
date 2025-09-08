-- FINAL SECURITY LOCKDOWN: Remove all conflicting policies and create single secure policies

-- Clean up ALL existing policies on sensitive tables
DROP POLICY IF EXISTS "Contact submissions admin only" ON public.contact_submissions;
DROP POLICY IF EXISTS "DEAN users can manage contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_secure_dean_only" ON public.contact_submissions;

DROP POLICY IF EXISTS "Coupon usage access" ON public.coupon_usage;
DROP POLICY IF EXISTS "DENY_ALL_anon_coupon_usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "Influencers can view their own coupon usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "Users can view their own coupon usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "coupon_usage_secure" ON public.coupon_usage;

DROP POLICY IF EXISTS "DENY_ALL_anon_influencer_coupons" ON public.influencer_coupons;
DROP POLICY IF EXISTS "DENY_ALL_public_influencer_coupons" ON public.influencer_coupons;
DROP POLICY IF EXISTS "Influencer coupons access" ON public.influencer_coupons;
DROP POLICY IF EXISTS "coupons_dean_audited_access" ON public.influencer_coupons;
DROP POLICY IF EXISTS "coupons_owner_restricted_read" ON public.influencer_coupons;
DROP POLICY IF EXISTS "influencer_coupons_secure" ON public.influencer_coupons;

DROP POLICY IF EXISTS "DENY_ALL_anon_influencer_orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "Influencer orders access" ON public.influencer_orders;
DROP POLICY IF EXISTS "Influencers can view their own orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "influencer_orders_secure" ON public.influencer_orders;
DROP POLICY IF EXISTS "influencer_own_orders" ON public.influencer_orders;

DROP POLICY IF EXISTS "DEAN users can manage all payouts" ON public.influencer_payouts;
DROP POLICY IF EXISTS "Influencer can view their own payouts" ON public.influencer_payouts;
DROP POLICY IF EXISTS "influencer_payouts_secure" ON public.influencer_payouts;

DROP POLICY IF EXISTS "Referrals access" ON public.referrals;
DROP POLICY IF EXISTS "Users can view their own referrals" ON public.referrals;
DROP POLICY IF EXISTS "referrals_secure" ON public.referrals;

DROP POLICY IF EXISTS "Subscribers user access" ON public.subscribers;
DROP POLICY IF EXISTS "Users can manage their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "subscribers_secure_access" ON public.subscribers;

-- Create SINGLE, SECURE policies for each table

-- SUBSCRIBERS: Strictest security - users only see their own subscription
CREATE POLICY "subscribers_user_only" 
ON public.subscribers 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- CONTACT SUBMISSIONS: Only DEAN tier can access - no public access
CREATE POLICY "contact_dean_only" 
ON public.contact_submissions 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- COUPON USAGE: Only related users can access
CREATE POLICY "coupon_usage_restricted" 
ON public.coupon_usage 
FOR ALL 
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (auth.uid() = influencer_id) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  (auth.uid() = user_id) OR 
  (auth.uid() = influencer_id) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- INFLUENCER ORDERS: Only influencer owners and DEANs
CREATE POLICY "influencer_orders_restricted" 
ON public.influencer_orders 
FOR ALL 
TO authenticated
USING (
  (auth.uid() = influencer_id) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  (auth.uid() = influencer_id) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- REFERRALS: Only involved parties
CREATE POLICY "referrals_restricted" 
ON public.referrals 
FOR ALL 
TO authenticated
USING (
  (auth.uid() = referrer_id) OR 
  (auth.uid() = referred_user_id) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  (auth.uid() = referrer_id) OR 
  (auth.uid() = referred_user_id) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- INFLUENCER COUPONS: Only owners and DEANs
CREATE POLICY "influencer_coupons_restricted" 
ON public.influencer_coupons 
FOR ALL 
TO authenticated
USING (
  (auth.uid() = influencer_id) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  (auth.uid() = influencer_id) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);

-- INFLUENCER PAYOUTS: Only owners and DEANs
CREATE POLICY "influencer_payouts_restricted" 
ON public.influencer_payouts 
FOR ALL 
TO authenticated
USING (
  (auth.uid() = influencer_id) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
)
WITH CHECK (
  (auth.uid() = influencer_id) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND user_tier = 'DEAN'
  )
);
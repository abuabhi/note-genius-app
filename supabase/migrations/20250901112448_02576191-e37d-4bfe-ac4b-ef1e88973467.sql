-- First check what policies exist and drop them properly
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop existing dangerous policies if they exist
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('contact_submissions', 'coupon_usage', 'influencer_orders', 'influencer_payouts', 'referrals')
        AND (policyname LIKE '%system%' OR policyname LIKE '%public%' OR policyname = 'contact_public_insert')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
    END LOOP;
END $$;

-- Now create the secure policies (skip if they already exist)
DO $$
BEGIN
    -- Contact submissions: DEAN admin access only
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contact_submissions' AND policyname = 'DEAN users can manage contact submissions') THEN
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
    END IF;

    -- Subscribers: user can only see their own data  
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscribers' AND policyname = 'Users can manage their own subscription') THEN
        CREATE POLICY "Users can manage their own subscription" 
          ON public.subscribers 
          FOR ALL 
          USING (auth.uid() = user_id);
    END IF;

    -- Coupon usage: read-only for users
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'coupon_usage' AND policyname = 'Influencers can view their own coupon usage') THEN
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
    END IF;

    -- Referrals: read-only for participants
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'referrals' AND policyname = 'Users can view their own referrals') THEN
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
    END IF;
END $$;
-- FINAL SECURITY FIXES - Address Remaining Critical Issues (Fixed)
-- Handle existing policies and tables properly

-- Fix subscribers table policy (replace existing one)
DROP POLICY IF EXISTS "Users can only access their own subscription data" ON public.subscribers;

-- Create comprehensive policy for subscribers table
CREATE POLICY "Users can only access their own subscription data" 
ON public.subscribers FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Only create coupon_usage table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coupon_usage') THEN
    CREATE TABLE public.coupon_usage (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      coupon_id uuid NOT NULL,
      user_id uuid NOT NULL,
      order_id uuid,
      discount_amount numeric(10,2) NOT NULL,
      used_at timestamp with time zone NOT NULL DEFAULT now(),
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );
    
    -- Enable RLS on new table
    ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Only create influencer_orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'influencer_orders') THEN
    CREATE TABLE public.influencer_orders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      influencer_id uuid NOT NULL,
      customer_email text NOT NULL,
      order_amount numeric(10,2) NOT NULL,
      commission_rate numeric(4,2) NOT NULL,
      commission_amount numeric(10,2) NOT NULL,
      coupon_code text,
      order_date timestamp with time zone NOT NULL DEFAULT now(),
      status text NOT NULL DEFAULT 'pending',
      created_at timestamp with time zone NOT NULL DEFAULT now()
    );
    
    -- Enable RLS on new table
    ALTER TABLE public.influencer_orders ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own coupon usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "DEAN users can view all coupon usage" ON public.coupon_usage;
DROP POLICY IF EXISTS "System can insert coupon usage" ON public.coupon_usage;

DROP POLICY IF EXISTS "Influencers can view their own orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "DEAN users can view all influencer orders" ON public.influencer_orders;
DROP POLICY IF EXISTS "System can insert influencer orders" ON public.influencer_orders;

-- Create policies for coupon_usage (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coupon_usage') THEN
    -- Users can view their own coupon usage
    EXECUTE 'CREATE POLICY "Users can view their own coupon usage" 
    ON public.coupon_usage FOR SELECT 
    USING (user_id = auth.uid())';
    
    -- DEAN users can view all coupon usage
    EXECUTE 'CREATE POLICY "DEAN users can view all coupon usage" 
    ON public.coupon_usage FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_tier = ''DEAN''
      )
    )';
    
    -- System can insert coupon usage records
    EXECUTE 'CREATE POLICY "System can insert coupon usage" 
    ON public.coupon_usage FOR INSERT 
    WITH CHECK (true)';
  END IF;
END
$$;

-- Create policies for influencer_orders (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'influencer_orders') THEN
    -- Influencers can view their own orders
    EXECUTE 'CREATE POLICY "Influencers can view their own orders" 
    ON public.influencer_orders FOR SELECT 
    USING (influencer_id = auth.uid())';
    
    -- DEAN users can view all orders
    EXECUTE 'CREATE POLICY "DEAN users can view all influencer orders" 
    ON public.influencer_orders FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND user_tier = ''DEAN''
      )
    )';
    
    -- System can insert order records
    EXECUTE 'CREATE POLICY "System can insert influencer orders" 
    ON public.influencer_orders FOR INSERT 
    WITH CHECK (true)';
  END IF;
END
$$;

-- Ensure RLS is forced on all sensitive tables
ALTER TABLE public.subscribers FORCE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_coupons FORCE ROW LEVEL SECURITY;

-- Force RLS on new tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coupon_usage') THEN
    ALTER TABLE public.coupon_usage FORCE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'influencer_orders') THEN
    ALTER TABLE public.influencer_orders FORCE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Revoke public access from sensitive tables
REVOKE ALL ON public.subscribers FROM anon;
REVOKE ALL ON public.contact_submissions FROM anon;
REVOKE ALL ON public.influencer_coupons FROM anon;

-- Revoke access from new tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coupon_usage') THEN
    REVOKE ALL ON public.coupon_usage FROM anon;
    GRANT SELECT ON public.coupon_usage TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'influencer_orders') THEN
    REVOKE ALL ON public.influencer_orders FROM anon;
    GRANT SELECT ON public.influencer_orders TO authenticated;
  END IF;
END
$$;
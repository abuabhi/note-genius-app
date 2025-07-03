-- Create influencer coupons table
CREATE TABLE IF NOT EXISTS public.influencer_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.profiles(id),
  coupon_code TEXT UNIQUE NOT NULL,
  discount_percentage DECIMAL(5,2),
  discount_amount DECIMAL(10,2),
  usage_limit INTEGER DEFAULT NULL,
  current_usage INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_discount_type CHECK (
    (discount_percentage IS NOT NULL AND discount_amount IS NULL) OR
    (discount_percentage IS NULL AND discount_amount IS NOT NULL)
  ),
  CONSTRAINT check_percentage_range CHECK (
    discount_percentage IS NULL OR (discount_percentage > 0 AND discount_percentage <= 100)
  )
);

-- Create enhanced order tracking table
CREATE TABLE IF NOT EXISTS public.influencer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  customer_email TEXT,
  influencer_id UUID REFERENCES public.profiles(id),
  coupon_code TEXT,
  order_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  commission_rate DECIMAL(5,4) DEFAULT 0.10,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.influencer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for influencer_coupons
CREATE POLICY "DEAN users can manage all coupons" 
ON public.influencer_coupons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_tier = 'DEAN'
  )
);

CREATE POLICY "Influencers can view their own coupons" 
ON public.influencer_coupons 
FOR SELECT 
USING (influencer_id = auth.uid());

CREATE POLICY "Public can view active coupons for validation" 
ON public.influencer_coupons 
FOR SELECT 
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for influencer_orders
CREATE POLICY "DEAN users can view all orders" 
ON public.influencer_orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_tier = 'DEAN'
  )
);

CREATE POLICY "Influencers can view their own orders" 
ON public.influencer_orders 
FOR SELECT 
USING (influencer_id = auth.uid());

CREATE POLICY "System can insert orders" 
ON public.influencer_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update orders" 
ON public.influencer_orders 
FOR UPDATE 
USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_influencer_coupons_code ON public.influencer_coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_influencer_coupons_influencer ON public.influencer_coupons(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_orders_influencer ON public.influencer_orders(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_orders_stripe ON public.influencer_orders(stripe_session_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_influencer_coupons_updated_at
BEFORE UPDATE ON public.influencer_coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_influencer_orders_updated_at
BEFORE UPDATE ON public.influencer_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique coupon codes
CREATE OR REPLACE FUNCTION public.generate_influencer_coupon_code(influencer_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_code text;
  full_code text;
  code_suffix text;
  attempt_count integer := 0;
BEGIN
  -- Create base code from username (max 8 chars, uppercase)
  base_code := upper(left(regexp_replace(influencer_username, '[^a-zA-Z0-9]', '', 'g'), 8));
  
  -- Try to generate unique code
  LOOP
    IF attempt_count = 0 THEN
      code_suffix := '';
    ELSE
      code_suffix := lpad(attempt_count::text, 2, '0');
    END IF;
    
    full_code := base_code || code_suffix;
    
    -- Check if code exists
    IF NOT EXISTS (SELECT 1 FROM public.influencer_coupons WHERE coupon_code = full_code) THEN
      RETURN full_code;
    END IF;
    
    attempt_count := attempt_count + 1;
    
    -- Prevent infinite loop
    IF attempt_count > 99 THEN
      full_code := base_code || floor(random() * 10000)::text;
      RETURN full_code;
    END IF;
  END LOOP;
END;
$$;

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code_param text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_record public.influencer_coupons%ROWTYPE;
  result jsonb;
BEGIN
  -- Find the coupon
  SELECT * INTO coupon_record
  FROM public.influencer_coupons
  WHERE coupon_code = coupon_code_param
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > now())
  AND (usage_limit IS NULL OR current_usage < usage_limit);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Coupon not found, expired, or usage limit reached'
    );
  END IF;
  
  -- Return coupon details
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', coupon_record.id,
    'influencer_id', coupon_record.influencer_id,
    'discount_percentage', coupon_record.discount_percentage,
    'discount_amount', coupon_record.discount_amount,
    'usage_limit', coupon_record.usage_limit,
    'current_usage', coupon_record.current_usage
  );
END;
$$;
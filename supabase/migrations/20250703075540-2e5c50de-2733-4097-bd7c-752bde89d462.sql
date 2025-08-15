
-- Add new fields to profiles table for influencer coupon management
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS influencer_coupon_percentage INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS influencer_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create influencer_coupons table
CREATE TABLE public.influencer_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage IN (10, 15, 20)),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id), -- DEAN who created it
  
  -- Ensure one active coupon per influencer
  CONSTRAINT unique_active_coupon_per_influencer 
    EXCLUDE (influencer_id WITH =) WHERE (is_active = true)
);

-- Create coupon_usage table to track when coupons are used
CREATE TABLE public.coupon_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.influencer_coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL, -- GRADUATE, MASTER, etc.
  original_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate usage by same user
  CONSTRAINT unique_user_coupon_usage UNIQUE (coupon_id, user_id)
);

-- Create influencer_payouts table for tracking commission payments
CREATE TABLE public.influencer_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_usage_count INTEGER NOT NULL DEFAULT 0,
  total_commission DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payout_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'paid', 'failed')),
  payout_date TIMESTAMP WITH TIME ZONE,
  payout_method TEXT DEFAULT 'bank_transfer',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure no overlapping payout periods for same influencer
  CONSTRAINT unique_influencer_payout_period 
    EXCLUDE (influencer_id WITH =, daterange(period_start, period_end, '[]') WITH &&)
);

-- Enable Row Level Security on all new tables
ALTER TABLE public.influencer_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for influencer_coupons
CREATE POLICY "Influencers can view their own coupons" 
  ON public.influencer_coupons 
  FOR SELECT 
  USING (auth.uid() = influencer_id);

CREATE POLICY "DEAN users can view all coupons" 
  ON public.influencer_coupons 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  ));

CREATE POLICY "DEAN users can manage all coupons" 
  ON public.influencer_coupons 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  ));

-- RLS Policies for coupon_usage
CREATE POLICY "Influencers can view their coupon usage" 
  ON public.coupon_usage 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.influencer_coupons 
    WHERE id = coupon_usage.coupon_id AND influencer_id = auth.uid()
  ));

CREATE POLICY "Users can view their own coupon usage" 
  ON public.coupon_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "DEAN users can view all coupon usage" 
  ON public.coupon_usage 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  ));

CREATE POLICY "System can insert coupon usage" 
  ON public.coupon_usage 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for influencer_payouts
CREATE POLICY "Influencers can view their own payouts" 
  ON public.influencer_payouts 
  FOR SELECT 
  USING (auth.uid() = influencer_id);

CREATE POLICY "DEAN users can manage all payouts" 
  ON public.influencer_payouts 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  ));

-- Create function to generate unique coupon code
CREATE OR REPLACE FUNCTION public.generate_unique_coupon_code(
  first_name TEXT, 
  percentage INTEGER
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base code from first name + percentage
  base_code := UPPER(TRIM(first_name)) || percentage::TEXT;
  final_code := base_code;
  
  -- Check if code exists and add number suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.influencer_coupons WHERE coupon_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || counter::TEXT;
  END LOOP;
  
  RETURN final_code;
END;
$$;

-- Create function to auto-generate coupon when user becomes influencer
CREATE OR REPLACE FUNCTION public.create_influencer_coupon_on_promotion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_first_name TEXT;
  coupon_code TEXT;
  coupon_percentage INTEGER;
BEGIN
  -- Only proceed if user just became an influencer
  IF OLD.is_influencer = false AND NEW.is_influencer = true THEN
    
    -- Get the user's first name (extract from username or use 'USER' as fallback)
    SELECT COALESCE(
      SPLIT_PART(NEW.username, ' ', 1),
      SPLIT_PART(NEW.username, '.', 1),
      SPLIT_PART(NEW.username, '_', 1),
      'USER'
    ) INTO user_first_name;
    
    -- Use the percentage set in the profile, default to 10%
    coupon_percentage := COALESCE(NEW.influencer_coupon_percentage, 10);
    
    -- Generate unique coupon code
    coupon_code := public.generate_unique_coupon_code(user_first_name, coupon_percentage);
    
    -- Create the coupon
    INSERT INTO public.influencer_coupons (
      influencer_id,
      coupon_code,
      discount_percentage,
      created_by
    ) VALUES (
      NEW.id,
      coupon_code,
      coupon_percentage,
      NEW.influencer_promoted_by
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-coupon generation
CREATE TRIGGER create_coupon_on_influencer_promotion
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_influencer_coupon_on_promotion();

-- Create function to calculate commission (example: 50% of discount amount)
CREATE OR REPLACE FUNCTION public.calculate_commission(
  discount_amount DECIMAL,
  commission_rate DECIMAL DEFAULT 0.5
) RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN ROUND(discount_amount * commission_rate, 2);
END;
$$;

-- Create function to get coupon analytics for influencers
CREATE OR REPLACE FUNCTION public.get_influencer_coupon_analytics(influencer_user_id UUID)
RETURNS TABLE(
  total_uses BIGINT,
  total_revenue_generated DECIMAL,
  total_commission_earned DECIMAL,
  this_month_uses BIGINT,
  this_month_commission DECIMAL,
  avg_order_value DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(cu.id) as total_uses,
    COALESCE(SUM(cu.final_price), 0) as total_revenue_generated,
    COALESCE(SUM(cu.commission_amount), 0) as total_commission_earned,
    COUNT(cu.id) FILTER (WHERE cu.used_at >= date_trunc('month', CURRENT_DATE)) as this_month_uses,
    COALESCE(SUM(cu.commission_amount) FILTER (WHERE cu.used_at >= date_trunc('month', CURRENT_DATE)), 0) as this_month_commission,
    COALESCE(AVG(cu.final_price), 0) as avg_order_value
  FROM public.coupon_usage cu
  JOIN public.influencer_coupons ic ON cu.coupon_id = ic.id
  WHERE ic.influencer_id = influencer_user_id;
END;
$$;

-- Create function to get admin coupon analytics
CREATE OR REPLACE FUNCTION public.get_admin_coupon_analytics()
RETURNS TABLE(
  total_coupons BIGINT,
  active_coupons BIGINT,
  total_uses BIGINT,
  total_revenue DECIMAL,
  total_commissions DECIMAL,
  top_performing_coupon TEXT,
  top_performer_uses BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.influencer_coupons) as total_coupons,
    (SELECT COUNT(*) FROM public.influencer_coupons WHERE is_active = true) as active_coupons,
    COALESCE((SELECT COUNT(*) FROM public.coupon_usage), 0) as total_uses,
    COALESCE((SELECT SUM(final_price) FROM public.coupon_usage), 0) as total_revenue,
    COALESCE((SELECT SUM(commission_amount) FROM public.coupon_usage), 0) as total_commissions,
    (SELECT ic.coupon_code 
     FROM public.influencer_coupons ic
     JOIN public.coupon_usage cu ON ic.id = cu.coupon_id
     GROUP BY ic.id, ic.coupon_code
     ORDER BY COUNT(cu.id) DESC
     LIMIT 1) as top_performing_coupon,
    COALESCE((SELECT COUNT(cu.id)
     FROM public.influencer_coupons ic
     JOIN public.coupon_usage cu ON ic.id = cu.coupon_id
     GROUP BY ic.id
     ORDER BY COUNT(cu.id) DESC
     LIMIT 1), 0) as top_performer_uses;
END;
$$;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column_coupons()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_influencer_coupons_updated_at
  BEFORE UPDATE ON public.influencer_coupons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column_coupons();

CREATE TRIGGER update_influencer_payouts_updated_at
  BEFORE UPDATE ON public.influencer_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column_coupons();

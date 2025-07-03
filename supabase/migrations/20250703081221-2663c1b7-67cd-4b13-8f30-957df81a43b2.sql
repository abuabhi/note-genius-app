-- Create coupon usage tracking table
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  influencer_id UUID REFERENCES public.profiles(id),
  usage_date TIMESTAMPTZ DEFAULT now(),
  order_value DECIMAL(10,2),
  commission_rate DECIMAL(5,4) DEFAULT 0.10,
  commission_amount DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create influencer payouts table
CREATE TABLE IF NOT EXISTS public.influencer_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.profiles(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_commission DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_usage_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  payment_method TEXT,
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupon_usage
CREATE POLICY "DEAN users can view all coupon usage" 
ON public.coupon_usage 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_tier = 'DEAN'
  )
);

CREATE POLICY "Influencers can view their own coupon usage" 
ON public.coupon_usage 
FOR SELECT 
USING (influencer_id = auth.uid());

CREATE POLICY "System can insert coupon usage" 
ON public.coupon_usage 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for influencer_payouts
CREATE POLICY "DEAN users can manage all payouts" 
ON public.influencer_payouts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_tier = 'DEAN'
  )
);

CREATE POLICY "Influencers can view their own payouts" 
ON public.influencer_payouts 
FOR SELECT 
USING (influencer_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupon_usage_influencer ON public.coupon_usage(influencer_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_code ON public.coupon_usage(coupon_code);
CREATE INDEX IF NOT EXISTS idx_payouts_influencer ON public.influencer_payouts(influencer_id, period_start, period_end);

-- Add trigger for updating payout timestamps
CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON public.influencer_payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
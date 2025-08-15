-- Add webhook configuration for Stripe webhook function
UPDATE supabase_functions.functions 
SET verify_jwt = false 
WHERE name = 'stripe-webhook';

-- Add influencer_payouts table for tracking payouts
CREATE TABLE IF NOT EXISTS public.influencer_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.profiles(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  orders_count INTEGER DEFAULT 0,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.influencer_payouts ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX IF NOT EXISTS idx_influencer_payouts_influencer ON public.influencer_payouts(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_payouts_status ON public.influencer_payouts(status);
CREATE INDEX IF NOT EXISTS idx_influencer_payouts_period ON public.influencer_payouts(period_start, period_end);

-- Add trigger for updating timestamps
CREATE TRIGGER update_influencer_payouts_updated_at
BEFORE UPDATE ON public.influencer_payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Add billing cycle tracking to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN billing_cycle_start DATE;

-- Create tier change history table for tracking mid-cycle upgrades
CREATE TABLE public.tier_change_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_tier TEXT NOT NULL,
  to_tier TEXT NOT NULL,
  change_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  billing_cycle_start DATE NOT NULL,
  prorated_amount DECIMAL(10,2),
  next_billing_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on tier_change_history table
ALTER TABLE public.tier_change_history ENABLE ROW LEVEL SECURITY;

-- Create policies for tier_change_history
CREATE POLICY "Users can view their own tier change history"
ON public.tier_change_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert tier change history"
ON public.tier_change_history
FOR INSERT
WITH CHECK (true);

-- Update existing subscriber records with billing cycle start date
-- Set billing cycle start to subscription start date or a default date
UPDATE public.subscribers 
SET billing_cycle_start = COALESCE(
  created_at::DATE,
  '2024-07-05'::DATE
)
WHERE billing_cycle_start IS NULL;

-- Make billing_cycle_start NOT NULL after setting default values
ALTER TABLE public.subscribers 
ALTER COLUMN billing_cycle_start SET NOT NULL;

-- Create index for better performance on billing cycle queries
CREATE INDEX idx_subscribers_billing_cycle ON public.subscribers(user_id, billing_cycle_start);
CREATE INDEX idx_tier_change_history_user_id ON public.tier_change_history(user_id);
CREATE INDEX idx_note_enrichment_usage_billing_cycle ON public.note_enrichment_usage(user_id, created_at);
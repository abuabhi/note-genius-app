-- Add influencer tracking columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_influencer BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS influencer_tier TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS influencer_metadata JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS influencer_promoted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS influencer_promoted_by UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS influencer_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS influencer_notes TEXT;

-- Create influencer promotions audit table
CREATE TABLE IF NOT EXISTS public.influencer_promotions_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  promoted_by UUID NOT NULL,
  from_tier TEXT,
  to_tier TEXT,
  promotion_type TEXT DEFAULT 'influencer',
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on the audit table
ALTER TABLE public.influencer_promotions_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the audit table
CREATE POLICY "DEAN users can view all promotion audits" 
ON public.influencer_promotions_audit 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_tier = 'DEAN'
  )
);

CREATE POLICY "DEAN users can insert promotion audits" 
ON public.influencer_promotions_audit 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_tier = 'DEAN'
  )
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_influencer ON public.profiles(is_influencer, influencer_expires_at);
CREATE INDEX IF NOT EXISTS idx_influencer_audit_user ON public.influencer_promotions_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_influencer_audit_promoted_by ON public.influencer_promotions_audit(promoted_by);
-- Create blog campaigns table
CREATE TABLE public.blog_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  topic_strategy TEXT NOT NULL DEFAULT 'random',
  fixed_topic TEXT,
  keywords TEXT[],
  category_id UUID,
  frequency_type TEXT NOT NULL DEFAULT 'days',
  frequency_value INTEGER NOT NULL DEFAULT 7,
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  auto_publish BOOLEAN NOT NULL DEFAULT true,
  publish_delay_hours INTEGER DEFAULT 0,
  content_type TEXT DEFAULT 'educational',
  min_word_count INTEGER DEFAULT 800,
  max_word_count INTEGER DEFAULT 1500,
  seo_keywords TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog campaign topics table for topic rotation
CREATE TABLE public.blog_campaign_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.blog_campaigns(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_used BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign run history table
CREATE TABLE public.blog_campaign_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.blog_campaigns(id) ON DELETE CASCADE,
  blog_post_id UUID REFERENCES public.blog_posts(id),
  topic_used TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  run_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.blog_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_campaign_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_campaign_runs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blog_campaigns
CREATE POLICY "Users can manage their own campaigns"
ON public.blog_campaigns
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for blog_campaign_topics
CREATE POLICY "Users can manage topics for their campaigns"
ON public.blog_campaign_topics
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.blog_campaigns
  WHERE blog_campaigns.id = blog_campaign_topics.campaign_id
  AND blog_campaigns.user_id = auth.uid()
));

-- Create RLS policies for blog_campaign_runs
CREATE POLICY "Users can view runs for their campaigns"
ON public.blog_campaign_runs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.blog_campaigns
  WHERE blog_campaigns.id = blog_campaign_runs.campaign_id
  AND blog_campaigns.user_id = auth.uid()
));

-- Create function to update campaign updated_at
CREATE OR REPLACE FUNCTION public.update_blog_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_blog_campaigns_updated_at
BEFORE UPDATE ON public.blog_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_campaigns_updated_at();

-- Create function to calculate next run time
CREATE OR REPLACE FUNCTION public.calculate_next_campaign_run(
  p_frequency_type TEXT,
  p_frequency_value INTEGER,
  p_last_run TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
DECLARE
  base_time TIMESTAMP WITH TIME ZONE;
BEGIN
  base_time := COALESCE(p_last_run, NOW());
  
  CASE p_frequency_type
    WHEN 'days' THEN
      RETURN base_time + (p_frequency_value || ' days')::INTERVAL;
    WHEN 'weeks' THEN
      RETURN base_time + (p_frequency_value || ' weeks')::INTERVAL;
    WHEN 'months' THEN
      RETURN base_time + (p_frequency_value || ' months')::INTERVAL;
    ELSE
      RETURN base_time + (p_frequency_value || ' days')::INTERVAL;
  END CASE;
END;
$$;

-- Create function to get next topic for rotation
CREATE OR REPLACE FUNCTION public.get_next_campaign_topic(p_campaign_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_topic TEXT;
  topic_count INTEGER;
BEGIN
  -- Get count of topics
  SELECT COUNT(*) INTO topic_count
  FROM public.blog_campaign_topics
  WHERE campaign_id = p_campaign_id;
  
  IF topic_count = 0 THEN
    RETURN NULL;
  END IF;
  
  -- Try to get next unused topic
  SELECT topic INTO next_topic
  FROM public.blog_campaign_topics
  WHERE campaign_id = p_campaign_id
    AND is_used = false
  ORDER BY sort_order ASC, created_at ASC
  LIMIT 1;
  
  -- If all topics used, reset and get first topic
  IF next_topic IS NULL THEN
    UPDATE public.blog_campaign_topics
    SET is_used = false, last_used_at = NULL
    WHERE campaign_id = p_campaign_id;
    
    SELECT topic INTO next_topic
    FROM public.blog_campaign_topics
    WHERE campaign_id = p_campaign_id
    ORDER BY sort_order ASC, created_at ASC
    LIMIT 1;
  END IF;
  
  -- Mark topic as used
  IF next_topic IS NOT NULL THEN
    UPDATE public.blog_campaign_topics
    SET is_used = true, last_used_at = NOW()
    WHERE campaign_id = p_campaign_id AND topic = next_topic;
  END IF;
  
  RETURN next_topic;
END;
$$;
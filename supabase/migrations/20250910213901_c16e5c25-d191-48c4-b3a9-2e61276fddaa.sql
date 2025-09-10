-- Add missing columns for blog scheduling and AI generation
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS scheduled_for timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_ai_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS keywords text[],
ADD COLUMN IF NOT EXISTS auto_publish boolean DEFAULT false;

-- Create index for scheduled posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled ON blog_posts(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- Create blog analytics table for tracking performance
CREATE TABLE IF NOT EXISTS blog_analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  date date NOT NULL,
  views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  avg_time_on_page integer DEFAULT 0,
  bounce_rate decimal DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(post_id, date)
);

-- Enable RLS on blog_analytics
ALTER TABLE blog_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for blog analytics (DEAN users only)
CREATE POLICY "DEAN users can manage blog analytics" ON blog_analytics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  )
);

-- Create content generation queue table
CREATE TABLE IF NOT EXISTS blog_generation_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  topic text NOT NULL,
  target_keywords text[],
  content_type text DEFAULT 'article',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  generated_post_id uuid REFERENCES blog_posts(id),
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone
);

-- Enable RLS on blog_generation_queue
ALTER TABLE blog_generation_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for blog generation queue (DEAN users only)
CREATE POLICY "DEAN users can manage blog generation queue" ON blog_generation_queue
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_tier = 'DEAN'
  )
);

-- Function to auto-publish scheduled posts
CREATE OR REPLACE FUNCTION auto_publish_scheduled_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts 
  SET 
    status = 'published',
    published_at = now(),
    updated_at = now()
  WHERE 
    status = 'scheduled' 
    AND scheduled_for <= now()
    AND auto_publish = true;
END;
$$;
-- Create video analytics table
CREATE TABLE public.video_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_key TEXT NOT NULL,
  video_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('play', 'pause', 'complete', 'skip', '25_percent', '50_percent', '75_percent')),
  timestamp_seconds INTEGER,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create A/B testing table for videos
CREATE TABLE public.video_ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_key TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  video_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  traffic_percentage INTEGER NOT NULL DEFAULT 50 CHECK (traffic_percentage >= 0 AND traffic_percentage <= 100),
  conversion_rate DECIMAL DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user session tracking for social proof
CREATE TABLE public.user_activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('signup', 'first_note', 'first_flashcard', 'quiz_completed', 'study_session')),
  activity_data JSONB DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_feed ENABLE ROW LEVEL SECURITY;

-- Policies for video analytics
CREATE POLICY "Anyone can insert video analytics" ON public.video_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "DEAN users can view all video analytics" ON public.video_analytics FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_tier = 'DEAN'));

-- Policies for A/B tests
CREATE POLICY "Anyone can view active A/B tests" ON public.video_ab_tests FOR SELECT USING (is_active = true);
CREATE POLICY "DEAN users can manage A/B tests" ON public.video_ab_tests FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_tier = 'DEAN'));

-- Policies for activity feed
CREATE POLICY "Users can insert their own activity" ON public.user_activity_feed FOR INSERT 
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view public activities" ON public.user_activity_feed FOR SELECT 
USING (is_public = true);

-- Create indexes for performance
CREATE INDEX idx_video_analytics_video_key ON public.video_analytics(video_key);
CREATE INDEX idx_video_analytics_created_at ON public.video_analytics(created_at);
CREATE INDEX idx_video_ab_tests_video_key ON public.video_ab_tests(video_key);
CREATE INDEX idx_user_activity_feed_created_at ON public.user_activity_feed(created_at);
CREATE INDEX idx_user_activity_feed_activity_type ON public.user_activity_feed(activity_type);
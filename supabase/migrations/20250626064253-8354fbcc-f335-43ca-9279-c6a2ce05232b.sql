
-- Create learning insights table for storing calculated insights
CREATE TABLE public.learning_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  insight_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0.8,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create performance benchmarks table for anonymous comparison data
CREATE TABLE public.performance_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_name TEXT NOT NULL,
  grade_level TEXT,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  sample_size INTEGER DEFAULT 1,
  time_period TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create learning patterns table for user behavior patterns
CREATE TABLE public.learning_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}',
  strength_score NUMERIC DEFAULT 0.5,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create predictive analytics cache table
CREATE TABLE public.predictive_analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  prediction_data JSONB NOT NULL DEFAULT '{}',
  accuracy_score NUMERIC DEFAULT 0.0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '6 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content analysis cache table
CREATE TABLE public.content_analysis_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  content_type TEXT NOT NULL,
  subject TEXT,
  analysis_result JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for learning_insights
ALTER TABLE public.learning_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own learning insights" ON public.learning_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own learning insights" ON public.learning_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own learning insights" ON public.learning_insights FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for learning_patterns
ALTER TABLE public.learning_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own learning patterns" ON public.learning_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own learning patterns" ON public.learning_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own learning patterns" ON public.learning_patterns FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for predictive_analytics_cache
ALTER TABLE public.predictive_analytics_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own predictive analytics" ON public.predictive_analytics_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own predictive analytics" ON public.predictive_analytics_cache FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own predictive analytics" ON public.predictive_analytics_cache FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for content_analysis_cache
ALTER TABLE public.content_analysis_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own content analysis" ON public.content_analysis_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own content analysis" ON public.content_analysis_cache FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Performance benchmarks is public read-only for comparison
ALTER TABLE public.performance_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read performance benchmarks" ON public.performance_benchmarks FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_learning_insights_user_type ON public.learning_insights(user_id, insight_type);
CREATE INDEX idx_learning_patterns_user_type ON public.learning_patterns(user_id, pattern_type);
CREATE INDEX idx_predictive_cache_user_key ON public.predictive_analytics_cache(user_id, cache_key);
CREATE INDEX idx_content_analysis_hash ON public.content_analysis_cache(content_hash);
CREATE INDEX idx_performance_benchmarks_subject ON public.performance_benchmarks(subject_name, metric_type);

-- Create function to cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_analytics_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.learning_insights WHERE expires_at < now();
  DELETE FROM public.predictive_analytics_cache WHERE expires_at < now();
  DELETE FROM public.content_analysis_cache WHERE expires_at < now();
END;
$$;

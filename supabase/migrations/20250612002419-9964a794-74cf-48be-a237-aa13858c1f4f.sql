
-- Create help_content_analytics table to track individual help content views and interactions
CREATE TABLE public.help_content_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  content_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'view', 'video_play', 'video_complete', 'search', 'interaction'
  context TEXT, -- current page context when help was accessed
  session_id TEXT, -- to group related actions
  metadata JSONB DEFAULT '{}', -- additional data like search terms, video progress, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create help_search_analytics table to track search behavior
CREATE TABLE public.help_search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  search_term TEXT NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  selected_result_id TEXT, -- which result was clicked
  context TEXT, -- current page context
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create help_session_analytics table to track overall help usage sessions
CREATE TABLE public.help_session_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_duration_seconds INTEGER,
  pages_visited INTEGER DEFAULT 1,
  videos_watched INTEGER DEFAULT 0,
  searches_performed INTEGER DEFAULT 0,
  context TEXT, -- starting context
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.help_content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_session_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for help_content_analytics
CREATE POLICY "Users can view their own help content analytics" 
  ON public.help_content_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own help content analytics" 
  ON public.help_content_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for help_search_analytics  
CREATE POLICY "Users can view their own help search analytics" 
  ON public.help_search_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own help search analytics" 
  ON public.help_search_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for help_session_analytics
CREATE POLICY "Users can view their own help session analytics" 
  ON public.help_session_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own help session analytics" 
  ON public.help_session_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own help session analytics" 
  ON public.help_session_analytics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_help_content_analytics_user_id ON public.help_content_analytics(user_id);
CREATE INDEX idx_help_content_analytics_content_id ON public.help_content_analytics(content_id);
CREATE INDEX idx_help_content_analytics_created_at ON public.help_content_analytics(created_at);

CREATE INDEX idx_help_search_analytics_user_id ON public.help_search_analytics(user_id);
CREATE INDEX idx_help_search_analytics_search_term ON public.help_search_analytics(search_term);
CREATE INDEX idx_help_search_analytics_created_at ON public.help_search_analytics(created_at);

CREATE INDEX idx_help_session_analytics_user_id ON public.help_session_analytics(user_id);
CREATE INDEX idx_help_session_analytics_session_id ON public.help_session_analytics(session_id);
CREATE INDEX idx_help_session_analytics_created_at ON public.help_session_analytics(created_at);

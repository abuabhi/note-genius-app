
-- Drop existing Supadata tables and functions
DROP TABLE IF EXISTS public.supadata_usage;
DROP FUNCTION IF EXISTS public.get_supadata_credits_used_this_month();
DROP FUNCTION IF EXISTS public.get_supadata_usage_stats(text);

-- Create table to track AssemblyAI API usage for credit monitoring
CREATE TABLE public.assemblyai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  video_url TEXT NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  month_year TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM')
);

-- Add RLS policies
ALTER TABLE public.assemblyai_usage ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own usage (for future user dashboards)
CREATE POLICY "Users can view their own usage" 
  ON public.assemblyai_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for admins to view all usage (Dean tier)
CREATE POLICY "Admins can view all usage" 
  ON public.assemblyai_usage 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Index for efficient querying by month and user
CREATE INDEX idx_assemblyai_usage_month_year ON public.assemblyai_usage(month_year);
CREATE INDEX idx_assemblyai_usage_user_month ON public.assemblyai_usage(user_id, month_year);

-- Function to get total credits used this month
CREATE OR REPLACE FUNCTION public.get_assemblyai_credits_used_this_month()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(credits_used), 0)
    FROM public.assemblyai_usage 
    WHERE month_year = to_char(now(), 'YYYY-MM')
    AND success = true
  );
END;
$$;

-- Function to get detailed usage stats for admin dashboard
CREATE OR REPLACE FUNCTION public.get_assemblyai_usage_stats(target_month TEXT DEFAULT to_char(now(), 'YYYY-MM'))
RETURNS TABLE(
  total_credits INTEGER,
  total_requests INTEGER,
  successful_requests INTEGER,
  failed_requests INTEGER,
  unique_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN success = true THEN credits_used ELSE 0 END), 0)::INTEGER as total_credits,
    COUNT(*)::INTEGER as total_requests,
    COUNT(CASE WHEN success = true THEN 1 END)::INTEGER as successful_requests,
    COUNT(CASE WHEN success = false THEN 1 END)::INTEGER as failed_requests,
    COUNT(DISTINCT user_id)::INTEGER as unique_users
  FROM public.assemblyai_usage 
  WHERE month_year = target_month;
END;
$$;


-- Remove AssemblyAI related tables and functions
DROP TABLE IF EXISTS public.assemblyai_usage CASCADE;
DROP FUNCTION IF EXISTS public.get_assemblyai_credits_used_this_month();
DROP FUNCTION IF EXISTS public.get_assemblyai_usage_stats(text);

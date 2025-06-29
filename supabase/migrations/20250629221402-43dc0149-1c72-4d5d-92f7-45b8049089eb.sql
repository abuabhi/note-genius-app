
-- Enable required extensions for cron jobs and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the main daily digest cron job that runs every hour
SELECT cron.schedule(
  'enhanced-daily-digest-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/send-daily-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw"}'::jsonb,
    body := '{"source": "cron", "enhanced": true}'::jsonb
  ) as request_id;
  $$
);

-- Create the auto-escalation cron job that runs daily at 6 AM UTC
SELECT cron.schedule(
  'auto-escalate-todos-enhanced',
  '0 6 * * *', -- Daily at 6 AM UTC
  $$
  SELECT public.auto_escalate_overdue_todos();
  $$
);

-- Verify the cron jobs were created successfully
SELECT jobname, schedule, command FROM cron.job WHERE jobname IN ('enhanced-daily-digest-hourly', 'auto-escalate-todos-enhanced');

-- Create function to execute raw SQL (needed for cron setup)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Set up cron jobs for the notification system
SELECT cron.schedule(
  'daily-digest-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT net.http_post(
    url := 'https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/send-daily-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  ) as request_id;
  $$
);

-- Set up reminder processing cron job every 15 minutes
SELECT cron.schedule(
  'process-reminders-job',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url := 'https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/process-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  ) as request_id;
  $$
);

-- Set up auto-escalation cron job daily at 6 AM UTC
SELECT cron.schedule(
  'auto-escalate-todos',
  '0 6 * * *', -- Daily at 6 AM UTC
  $$
  SELECT public.auto_escalate_overdue_todos();
  $$
);

-- Set up cleanup cron job weekly
SELECT cron.schedule(
  'cleanup-reminders-weekly',
  '0 2 * * 0', -- Weekly on Sunday at 2 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/cleanup-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  ) as request_id;
  $$
);

-- Update the existing cron job to run every 30 minutes instead of hourly
SELECT cron.unschedule('enhanced-daily-digest-hourly');

-- Create new cron job that runs every 30 minutes
SELECT cron.schedule(
  'enhanced-daily-digest-30min',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT net.http_post(
    url := 'https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/send-daily-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw"}'::jsonb,
    body := '{"source": "cron", "enhanced": true}'::jsonb
  ) as request_id;
  $$
);


-- Enable the pg_cron and pg_net extensions if they're not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function that sets up a cron job to invoke our edge function
CREATE OR REPLACE FUNCTION public.setup_reminder_processing_cron(
  job_name TEXT,
  schedule TEXT,
  function_name TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_job TEXT;
  anon_key TEXT;
  project_ref TEXT;
BEGIN
  -- Check if the job already exists
  SELECT jobname INTO existing_job FROM cron.job WHERE jobname = job_name;
  
  -- Get the anon key from supabase_auth.config
  SELECT COALESCE(current_setting('request.headers', true)::json->>'apikey', decode(current_setting('auth.anon_key'), 'base64')) INTO anon_key;
  
  -- Get the project ref
  SELECT current_setting('app.settings.project_id') INTO project_ref;
  
  IF existing_job IS NOT NULL THEN
    -- If the job exists, update it
    EXECUTE format(
      $f$
      SELECT cron.alter_job(
        '%s',
        schedule => '%s',
        command => $$
          SELECT net.http_post(
            url := 'https://%s.supabase.co/functions/v1/%s',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer %s"}'::jsonb,
            body := '{}'::jsonb
          );
        $$
      )
      $f$,
      job_name, schedule, project_ref, function_name, anon_key
    );
    
    RETURN 'UPDATED';
  ELSE
    -- If the job doesn't exist, create it
    EXECUTE format(
      $f$
      SELECT cron.schedule(
        '%s',
        '%s',
        $$
          SELECT net.http_post(
            url := 'https://%s.supabase.co/functions/v1/%s',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer %s"}'::jsonb,
            body := '{}'::jsonb
          );
        $$
      )
      $f$,
      job_name, schedule, project_ref, function_name, anon_key
    );
    
    RETURN 'CREATED';
  END IF;
END;
$$;

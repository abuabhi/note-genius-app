-- Trigger Pushover notification on new user signup (via profiles insert)
CREATE OR REPLACE FUNCTION public.notify_pushover_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  fn_url text := 'https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/notify-new-signup';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw';
  user_email text;
BEGIN
  BEGIN
    SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
  EXCEPTION WHEN OTHERS THEN
    user_email := NULL;
  END;

  PERFORM net.http_post(
    url := fn_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object(
      'user_id', NEW.id,
      'email', COALESCE(user_email, ''),
      'full_name', COALESCE(NEW.full_name, '')
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Pushover notify failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_notify_pushover ON public.profiles;
CREATE TRIGGER on_profile_created_notify_pushover
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.notify_pushover_on_signup();
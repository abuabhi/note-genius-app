
-- Simplify reminder statuses to just 3 states
UPDATE public.reminders SET status = 'pending' WHERE status IN ('active', 'cancelled');
UPDATE public.reminders SET status = 'sent' WHERE status IN ('sent', 'completed');
UPDATE public.reminders SET status = 'dismissed' WHERE status IN ('dismissed', 'cancelled');

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reminders_status_time ON public.reminders(status, reminder_time) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_user_status ON public.reminders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reminders_processing ON public.reminders(status, reminder_time, user_id) WHERE status IN ('pending', 'sent');

-- Cleanup old functions and create simple batch processing function
CREATE OR REPLACE FUNCTION public.get_pending_notifications(batch_size integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  description text,
  reminder_time timestamp with time zone,
  type text,
  delivery_methods jsonb,
  priority text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.title,
    r.description,
    r.reminder_time,
    r.type,
    r.delivery_methods,
    r.priority
  FROM public.reminders r
  WHERE r.status = 'pending'
    AND r.reminder_time <= now()
  ORDER BY r.reminder_time ASC
  LIMIT batch_size;
END;
$$;

-- Simple function to mark notifications as sent
CREATE OR REPLACE FUNCTION public.mark_notifications_sent(notification_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.reminders 
  SET status = 'sent', updated_at = now()
  WHERE id = ANY(notification_ids)
    AND status = 'pending';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Clean digest preferences function
CREATE OR REPLACE FUNCTION public.get_digest_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  digest_time time,
  timezone text,
  last_sent_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    au.email,
    p.digest_time,
    p.timezone,
    p.last_digest_sent_at::date
  FROM public.email_digest_preferences p
  JOIN auth.users au ON au.id = p.user_id
  WHERE p.digest_enabled = true
    AND p.frequency = 'daily'
    AND (p.last_digest_sent_at IS NULL OR p.last_digest_sent_at::date < CURRENT_DATE);
END;
$$;


-- Add overdue todo management columns to reminders table
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS grace_period_days integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS escalation_level text DEFAULT 'normal' CHECK (escalation_level IN ('normal', 'urgent', 'critical')),
ADD COLUMN IF NOT EXISTS auto_archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS archived_reason text;

-- Add indexes for efficient overdue todo queries
CREATE INDEX IF NOT EXISTS idx_reminders_overdue_todos ON public.reminders(type, status, due_date, user_id) WHERE type = 'todo';
CREATE INDEX IF NOT EXISTS idx_reminders_escalation ON public.reminders(escalation_level, due_date) WHERE type = 'todo';

-- Create function to get overdue todos
CREATE OR REPLACE FUNCTION public.get_overdue_todos(p_user_id uuid)
RETURNS TABLE(
  todo_id uuid,
  title text,
  description text,
  due_date date,
  days_overdue integer,
  in_grace_period boolean,
  escalation_level text,
  priority text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as todo_id,
    r.title,
    r.description,
    r.due_date,
    (CURRENT_DATE - r.due_date)::integer as days_overdue,
    (CURRENT_DATE - r.due_date)::integer <= r.grace_period_days as in_grace_period,
    r.escalation_level,
    r.priority
  FROM public.reminders r
  WHERE r.user_id = p_user_id
    AND r.type = 'todo'
    AND r.status = 'pending'
    AND r.due_date < CURRENT_DATE
    AND r.auto_archived_at IS NULL
  ORDER BY r.due_date ASC, r.escalation_level DESC;
END;
$$;

-- Create email digest preferences table
CREATE TABLE IF NOT EXISTS public.email_digest_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  digest_enabled boolean DEFAULT true,
  digest_time time DEFAULT '08:00:00',
  timezone text DEFAULT 'UTC',
  frequency text DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'never')),
  include_goals boolean DEFAULT true,
  include_todos boolean DEFAULT true,
  include_completed boolean DEFAULT false,
  only_urgent boolean DEFAULT false,
  last_digest_sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Create digest content cache table for performance
CREATE TABLE IF NOT EXISTS public.digest_content_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('goals', 'todos', 'achievements')),
  content_data jsonb NOT NULL,
  generated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '24 hours')
);

-- Add RLS policies for email digest preferences
ALTER TABLE public.email_digest_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own digest preferences"
  ON public.email_digest_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own digest preferences"
  ON public.email_digest_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- Add RLS policies for digest content cache
ALTER TABLE public.digest_content_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own digest cache"
  ON public.digest_content_cache
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create trigger to auto-update digest preferences
CREATE OR REPLACE FUNCTION update_digest_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_digest_preferences_updated_at
  BEFORE UPDATE ON public.email_digest_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_digest_preferences_updated_at();

-- Create function to auto-escalate overdue todos
CREATE OR REPLACE FUNCTION public.auto_escalate_overdue_todos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Escalate to urgent after grace period
  UPDATE public.reminders
  SET escalation_level = 'urgent',
      updated_at = now()
  WHERE type = 'todo'
    AND status = 'pending'
    AND due_date < CURRENT_DATE
    AND (CURRENT_DATE - due_date) > grace_period_days
    AND escalation_level = 'normal'
    AND auto_archived_at IS NULL;

  -- Escalate to critical after 7 days overdue
  UPDATE public.reminders
  SET escalation_level = 'critical',
      updated_at = now()
  WHERE type = 'todo'
    AND status = 'pending'
    AND due_date < CURRENT_DATE
    AND (CURRENT_DATE - due_date) > 7
    AND escalation_level = 'urgent'
    AND auto_archived_at IS NULL;

  -- Auto-archive after 14 days overdue
  UPDATE public.reminders
  SET auto_archived_at = now(),
      archived_reason = 'Auto-archived due to being overdue for 14+ days',
      updated_at = now()
  WHERE type = 'todo'
    AND status = 'pending'
    AND due_date < CURRENT_DATE
    AND (CURRENT_DATE - due_date) > 14
    AND auto_archived_at IS NULL;
END;
$$;

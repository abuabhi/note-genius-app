
-- Step 1: Create automatic cleanup system for old reminders
CREATE OR REPLACE FUNCTION public.cleanup_old_reminders(
  retention_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  deleted_count INTEGER,
  archived_count INTEGER,
  cleanup_summary JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_reminders INTEGER := 0;
  archived_reminders INTEGER := 0;
  cleanup_date DATE;
BEGIN
  cleanup_date := CURRENT_DATE - retention_days;
  
  -- Archive old dismissed/cancelled reminders instead of deleting
  UPDATE public.reminders 
  SET 
    auto_archived_at = now(),
    archived_reason = 'Auto-archived: older than ' || retention_days || ' days',
    updated_at = now()
  WHERE status IN ('cancelled', 'sent')
    AND updated_at::date <= cleanup_date
    AND auto_archived_at IS NULL;
    
  GET DIAGNOSTICS archived_reminders = ROW_COUNT;
  
  -- Hard delete very old archived reminders (older than 90 days)
  DELETE FROM public.reminders 
  WHERE auto_archived_at IS NOT NULL 
    AND auto_archived_at::date <= (CURRENT_DATE - 90);
    
  GET DIAGNOSTICS deleted_reminders = ROW_COUNT;
  
  -- Return summary
  RETURN QUERY SELECT 
    deleted_reminders,
    archived_reminders,
    jsonb_build_object(
      'cleanup_date', cleanup_date,
      'retention_days', retention_days,
      'archived_count', archived_reminders,
      'deleted_count', deleted_reminders,
      'cleanup_timestamp', now()
    );
END;
$$;

-- Step 2: Enhanced recurring reminder logic - prevent duplicates
CREATE OR REPLACE FUNCTION public.create_next_recurring_reminder(
  original_reminder_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  original_reminder RECORD;
  next_reminder_time TIMESTAMP WITH TIME ZONE;
  new_reminder_id UUID;
BEGIN
  -- Get the original reminder
  SELECT * INTO original_reminder
  FROM public.reminders
  WHERE id = original_reminder_id;
  
  IF NOT FOUND OR original_reminder.recurrence = 'none' THEN
    RETURN NULL;
  END IF;
  
  -- Calculate next reminder time based on recurrence
  CASE original_reminder.recurrence
    WHEN 'daily' THEN
      next_reminder_time := original_reminder.reminder_time + INTERVAL '1 day';
    WHEN 'weekly' THEN
      next_reminder_time := original_reminder.reminder_time + INTERVAL '1 week';
    WHEN 'monthly' THEN
      next_reminder_time := original_reminder.reminder_time + INTERVAL '1 month';
    WHEN 'yearly' THEN
      next_reminder_time := original_reminder.reminder_time + INTERVAL '1 year';
    ELSE
      RETURN NULL;
  END CASE;
  
  -- Check if next reminder already exists (prevent duplicates)
  IF EXISTS (
    SELECT 1 FROM public.reminders
    WHERE user_id = original_reminder.user_id
      AND title = original_reminder.title
      AND reminder_time = next_reminder_time
      AND status = 'pending'
  ) THEN
    RETURN NULL; -- Duplicate prevention
  END IF;
  
  -- Create the next recurring reminder
  INSERT INTO public.reminders (
    user_id,
    title,
    description,
    reminder_time,
    due_date,
    type,
    status,
    priority,
    delivery_methods,
    recurrence,
    created_at,
    updated_at
  ) VALUES (
    original_reminder.user_id,
    original_reminder.title,
    original_reminder.description,
    next_reminder_time,
    CASE 
      WHEN original_reminder.due_date IS NOT NULL 
      THEN original_reminder.due_date + (next_reminder_time - original_reminder.reminder_time)::interval
      ELSE NULL
    END,
    original_reminder.type,
    'pending',
    original_reminder.priority,
    original_reminder.delivery_methods,
    original_reminder.recurrence,
    now(),
    now()
  ) RETURNING id INTO new_reminder_id;
  
  RETURN new_reminder_id;
END;
$$;

-- Step 3: Database health monitoring function
CREATE OR REPLACE FUNCTION public.get_reminder_system_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  health_stats JSONB;
  total_reminders INTEGER;
  pending_reminders INTEGER;
  overdue_reminders INTEGER;
  processed_today INTEGER;
  avg_processing_time NUMERIC;
  failed_reminders INTEGER;
BEGIN
  -- Get basic reminder counts
  SELECT COUNT(*) INTO total_reminders FROM public.reminders;
  SELECT COUNT(*) INTO pending_reminders FROM public.reminders WHERE status = 'pending';
  SELECT COUNT(*) INTO failed_reminders FROM public.reminders WHERE status = 'failed';
  
  -- Get overdue count
  SELECT COUNT(*) INTO overdue_reminders 
  FROM public.reminders 
  WHERE status = 'pending' 
    AND reminder_time < now();
  
  -- Get processed today count
  SELECT COUNT(*) INTO processed_today 
  FROM public.reminders 
  WHERE status = 'sent' 
    AND updated_at::date = CURRENT_DATE;
  
  -- Calculate average processing time (mock calculation)
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))), 0) 
  INTO avg_processing_time
  FROM public.reminders 
  WHERE status = 'sent' 
    AND updated_at >= (now() - INTERVAL '24 hours');
  
  -- Build health statistics
  health_stats := jsonb_build_object(
    'timestamp', now(),
    'total_reminders', total_reminders,
    'pending_reminders', pending_reminders,
    'overdue_reminders', overdue_reminders,
    'failed_reminders', failed_reminders,
    'processed_today', processed_today,
    'avg_processing_time_seconds', ROUND(avg_processing_time, 2),
    'system_status', CASE 
      WHEN overdue_reminders > 100 THEN 'critical'
      WHEN overdue_reminders > 50 THEN 'warning'
      WHEN failed_reminders > 10 THEN 'warning'
      ELSE 'healthy'
    END,
    'performance_metrics', jsonb_build_object(
      'success_rate', CASE 
        WHEN total_reminders > 0 
        THEN ROUND(((total_reminders - failed_reminders)::numeric / total_reminders::numeric) * 100, 2)
        ELSE 100 
      END,
      'processing_efficiency', CASE 
        WHEN pending_reminders > 0 
        THEN ROUND((processed_today::numeric / GREATEST(pending_reminders, 1)::numeric) * 100, 2)
        ELSE 100 
      END
    )
  );
  
  RETURN health_stats;
END;
$$;

-- Step 4: Add indexes for better performance on reminder queries
CREATE INDEX IF NOT EXISTS idx_reminders_recurring_processing 
ON public.reminders (recurrence, status, reminder_time) 
WHERE recurrence != 'none';

CREATE INDEX IF NOT EXISTS idx_reminders_cleanup_candidates 
ON public.reminders (status, updated_at, auto_archived_at) 
WHERE status IN ('cancelled', 'sent');

CREATE INDEX IF NOT EXISTS idx_reminders_health_monitoring 
ON public.reminders (status, reminder_time, created_at, updated_at);

-- Step 5: Create cleanup configuration table
CREATE TABLE IF NOT EXISTS public.reminder_cleanup_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retention_days INTEGER DEFAULT 30,
  auto_cleanup_enabled BOOLEAN DEFAULT true,
  last_cleanup_at TIMESTAMP WITH TIME ZONE,
  cleanup_schedule TEXT DEFAULT 'daily',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default cleanup configuration
INSERT INTO public.reminder_cleanup_config (retention_days, auto_cleanup_enabled)
VALUES (30, true)
ON CONFLICT DO NOTHING;

-- Add RLS for cleanup config (admin only)
ALTER TABLE public.reminder_cleanup_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated users can view cleanup config"
  ON public.reminder_cleanup_config
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Add trigger to update cleanup config timestamp
CREATE OR REPLACE FUNCTION update_cleanup_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cleanup_config_updated_at
  BEFORE UPDATE ON public.reminder_cleanup_config
  FOR EACH ROW
  EXECUTE FUNCTION update_cleanup_config_updated_at();

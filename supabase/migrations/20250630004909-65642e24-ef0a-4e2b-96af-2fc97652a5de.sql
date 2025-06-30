
-- Phase 1: Add database indexes for optimized reminder queries
CREATE INDEX IF NOT EXISTS idx_reminders_user_status_time ON public.reminders(user_id, status, reminder_time) WHERE status IN ('pending', 'sent');
CREATE INDEX IF NOT EXISTS idx_reminders_user_type_status ON public.reminders(user_id, type, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_realtime_updates ON public.reminders(user_id, updated_at) WHERE status IN ('pending', 'sent');

-- Add composite index for common reminder queries
CREATE INDEX IF NOT EXISTS idx_reminders_common_queries ON public.reminders(user_id, status, reminder_time, type) WHERE status IN ('pending', 'sent');

-- Add index for batch operations
CREATE INDEX IF NOT EXISTS idx_reminders_batch_operations ON public.reminders(id, user_id, status) WHERE status IN ('pending', 'sent');

-- Enable replica identity for realtime updates
ALTER TABLE public.reminders REPLICA IDENTITY FULL;

-- Add the table to realtime publication for optimized realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;

-- Create optimized function for batch reminder dismissal
CREATE OR REPLACE FUNCTION public.batch_dismiss_reminders(p_user_id uuid, p_reminder_ids uuid[])
RETURNS TABLE(dismissed_count integer, failed_ids uuid[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dismissed_count_result integer := 0;
  failed_ids_result uuid[] := '{}';
  reminder_id uuid;
BEGIN
  -- Use a transaction for consistency
  BEGIN
    -- Update all reminders in a single query for better performance
    UPDATE public.reminders 
    SET status = 'cancelled', updated_at = now()
    WHERE user_id = p_user_id 
      AND id = ANY(p_reminder_ids)
      AND status IN ('pending', 'sent');
    
    GET DIAGNOSTICS dismissed_count_result = ROW_COUNT;
    
    -- Check for any failed IDs (reminders that couldn't be updated)
    SELECT array_agg(unnest_id) INTO failed_ids_result
    FROM unnest(p_reminder_ids) AS unnest_id
    WHERE unnest_id NOT IN (
      SELECT id FROM public.reminders 
      WHERE user_id = p_user_id 
        AND id = ANY(p_reminder_ids) 
        AND status = 'cancelled'
    );
    
    -- Return results
    RETURN QUERY SELECT dismissed_count_result, COALESCE(failed_ids_result, '{}');
    
  EXCEPTION
    WHEN OTHERS THEN
      -- If anything fails, return error info
      RETURN QUERY SELECT 0::integer, p_reminder_ids;
  END;
END;
$$;

-- Create function for optimized reminder fetching with pagination
CREATE OR REPLACE FUNCTION public.get_user_reminders_paginated(
  p_user_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_status text[] DEFAULT ARRAY['pending', 'sent']
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  description text,
  reminder_time timestamp with time zone,
  due_date date,
  type text,
  status text,
  priority text,
  escalation_level text,
  delivery_methods jsonb,
  recurrence text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
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
    r.due_date,
    r.type,
    r.status,
    r.priority,
    r.escalation_level,
    r.delivery_methods,
    r.recurrence,
    r.created_at,
    r.updated_at
  FROM public.reminders r
  WHERE r.user_id = p_user_id
    AND r.status = ANY(p_status)
  ORDER BY r.reminder_time ASC NULLS LAST, r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

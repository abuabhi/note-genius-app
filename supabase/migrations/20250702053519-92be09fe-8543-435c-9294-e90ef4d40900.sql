
-- Remove the problematic CHECK constraint that's preventing status updates
ALTER TABLE public.reminders DROP CONSTRAINT IF EXISTS reminders_status_check;

-- Update the batch_dismiss_reminders function to use 'dismissed' status
CREATE OR REPLACE FUNCTION public.batch_dismiss_reminders(p_user_id uuid, p_reminder_ids uuid[])
 RETURNS TABLE(dismissed_count integer, failed_ids uuid[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  dismissed_count_result integer := 0;
  failed_ids_result uuid[] := '{}';
BEGIN
  -- Use a transaction for consistency
  BEGIN
    -- Update all reminders in a single query for better performance
    UPDATE public.reminders 
    SET status = 'dismissed', updated_at = now()
    WHERE user_id = p_user_id 
      AND id = ANY(p_reminder_ids)
      AND status = 'active';
    
    GET DIAGNOSTICS dismissed_count_result = ROW_COUNT;
    
    -- Check for any failed IDs (reminders that couldn't be updated)
    SELECT array_agg(unnest_id) INTO failed_ids_result
    FROM unnest(p_reminder_ids) AS unnest_id
    WHERE unnest_id NOT IN (
      SELECT id FROM public.reminders 
      WHERE user_id = p_user_id 
        AND id = ANY(p_reminder_ids) 
        AND status = 'dismissed'
    );
    
    -- Return results
    RETURN QUERY SELECT dismissed_count_result, COALESCE(failed_ids_result, '{}');
    
  EXCEPTION
    WHEN OTHERS THEN
      -- If anything fails, return error info
      RETURN QUERY SELECT 0::integer, p_reminder_ids;
  END;
END;
$function$;

-- Update all existing reminders to use the simplified status system
UPDATE public.reminders SET status = 'active' WHERE status IN ('pending', 'sent');
UPDATE public.reminders SET status = 'dismissed' WHERE status IN ('cancelled', 'completed');

-- Update the current user's subscriber record with proper billing cycle start
-- Based on the network requests showing subscription_end: "2025-08-27T01:30:09.000Z"
-- This means their subscription started around July 27th, so let's set billing cycle to July 5th

UPDATE public.subscribers 
SET billing_cycle_start = '2024-07-05'
WHERE user_id = '1bf8c758-f0ee-4b69-9eb7-c87aa99651ef'
AND billing_cycle_start = '2024-07-05'; -- Only update if it's still the default

-- Create a function to handle billing cycle aware AI enrichment count
CREATE OR REPLACE FUNCTION public.get_ai_enrichment_count_for_billing_cycle(user_id_param uuid, cycle_start_param date, cycle_end_param timestamp with time zone)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM public.note_enrichment_usage
    WHERE user_id = user_id_param
    AND created_at >= cycle_start_param::timestamp with time zone
    AND created_at <= cycle_end_param
  );
END;
$function$;
-- Fix the get_digest_users function to handle email type correctly
CREATE OR REPLACE FUNCTION public.get_digest_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  username text,
  digest_time time,
  timezone text,
  last_digest_sent_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    au.email::text,  -- Cast email to text explicitly
    p.username,
    COALESCE(edp.digest_time, '08:00:00'::time) as digest_time,
    COALESCE(edp.timezone, 'UTC') as timezone,
    edp.last_digest_sent_at
  FROM auth.users au
  JOIN public.profiles p ON au.id = p.id
  LEFT JOIN public.email_digest_preferences edp ON p.id = edp.user_id
  WHERE 
    -- User has digest enabled (default true if no preference set)
    COALESCE(edp.digest_enabled, true) = true
    AND au.email IS NOT NULL
    AND (
      -- No digest sent today yet
      edp.last_digest_sent_at IS NULL 
      OR 
      -- Last digest was sent yesterday or earlier
      DATE(edp.last_digest_sent_at) < CURRENT_DATE
    );
END;
$$;
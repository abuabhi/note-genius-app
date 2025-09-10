-- Fix security issue: Set search_path for the function
CREATE OR REPLACE FUNCTION auto_publish_scheduled_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE blog_posts 
  SET 
    status = 'published',
    published_at = now(),
    updated_at = now()
  WHERE 
    status = 'scheduled' 
    AND scheduled_for <= now()
    AND auto_publish = true;
END;
$$;
-- Fix the infinite recursion in profiles RLS policies and add first_name column

-- Drop the problematic RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "DEAN users can view all profiles" ON public.profiles;

-- Add first_name column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name text;

-- Create a safe RLS policy for DEAN users that doesn't cause recursion
-- Using a security definer function approach to avoid recursion
CREATE OR REPLACE FUNCTION public.is_dean_user(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id_param 
    AND user_tier = 'DEAN'
  );
$$;

-- Create new safe RLS policy using the function
CREATE POLICY "DEAN users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR public.is_dean_user(auth.uid())
);

-- Update the handle_new_user function to include first_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    first_name,
    user_tier, 
    onboarding_completed
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    new.raw_user_meta_data->>'first_name',
    'SCHOLAR', 
    FALSE
  );
  RETURN NEW;
END;
$$;
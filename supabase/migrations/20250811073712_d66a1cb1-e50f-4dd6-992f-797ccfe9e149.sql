-- Add avatar_url to profiles for storing chosen avatar image
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

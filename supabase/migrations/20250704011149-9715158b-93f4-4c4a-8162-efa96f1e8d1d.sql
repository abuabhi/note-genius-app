-- Create RLS policy to allow DEAN users to update other users' profiles for influencer promotion
CREATE POLICY "DEAN users can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_dean_user(auth.uid()));
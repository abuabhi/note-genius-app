-- Ensure RLS is enabled on contact_submissions table
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with better security
DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
DROP POLICY IF EXISTS "DEAN tier users can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "DEAN tier users can view all contact submissions" ON public.contact_submissions;

-- Create improved INSERT policy - allows anyone to submit contact forms
CREATE POLICY "Anyone can submit contact forms" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create improved SELECT policy using security definer function for better security
CREATE POLICY "Only DEAN users can view contact submissions" 
ON public.contact_submissions 
FOR SELECT 
USING (public.is_dean_user(auth.uid()));

-- Create improved UPDATE policy using security definer function for better security
CREATE POLICY "Only DEAN users can update contact submissions" 
ON public.contact_submissions 
FOR UPDATE 
USING (public.is_dean_user(auth.uid()));

-- Add DELETE policy for complete security coverage
CREATE POLICY "Only DEAN users can delete contact submissions" 
ON public.contact_submissions 
FOR DELETE 
USING (public.is_dean_user(auth.uid()));

-- Add helpful comment explaining the security model
COMMENT ON TABLE public.contact_submissions IS 
'Contact form submissions. Public can submit (INSERT), but only DEAN tier admin users can view, update, or delete submissions to protect customer privacy.';
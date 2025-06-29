
-- Update RLS policies to use DEAN tier for admin access
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.contact_submissions;

-- Create policy for DEAN tier users to view all submissions
CREATE POLICY "DEAN tier users can view all contact submissions" 
  ON public.contact_submissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Create policy for DEAN tier users to update submissions
CREATE POLICY "DEAN tier users can update contact submissions" 
  ON public.contact_submissions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

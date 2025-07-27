-- Fix storage bucket access for note_images
UPDATE storage.buckets SET public = true WHERE id = 'note_images';

-- Create comprehensive storage policies for note_images bucket
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'note_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'note_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'note_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'note_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read access for note_images bucket (needed for edge function access)
CREATE POLICY "Public read access for note_images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'note_images');
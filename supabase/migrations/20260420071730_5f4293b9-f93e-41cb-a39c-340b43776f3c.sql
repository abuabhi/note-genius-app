-- 1) Fix broken chat_conversations ALL policy
DROP POLICY IF EXISTS "Users can access their conversations" ON public.chat_conversations;

CREATE POLICY "Users can access their conversations"
ON public.chat_conversations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = chat_conversations.id
      AND cp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = chat_conversations.id
      AND cp.user_id = auth.uid()
  )
);

-- 2) Make audio bucket private and add ownership-scoped policies
UPDATE storage.buckets SET public = false WHERE id = 'audio';

DROP POLICY IF EXISTS "Audio: users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Audio: users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Audio: users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Audio: users can delete own files" ON storage.objects;

CREATE POLICY "Audio: users can read own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'audio' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Audio: users can upload own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'audio' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Audio: users can update own files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'audio' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Audio: users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'audio' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 3) Lock down documents bucket: add ownership checks
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Documents: users can view own" ON storage.objects;
DROP POLICY IF EXISTS "Documents: users can upload own" ON storage.objects;
DROP POLICY IF EXISTS "Documents: users can update own" ON storage.objects;
DROP POLICY IF EXISTS "Documents: users can delete own" ON storage.objects;

CREATE POLICY "Documents: users can view own"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Documents: users can upload own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Documents: users can update own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Documents: users can delete own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);
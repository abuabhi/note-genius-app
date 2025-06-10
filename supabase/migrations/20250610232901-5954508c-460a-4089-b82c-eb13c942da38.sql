
-- Create table for note-specific chat messages
CREATE TABLE note_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the table
ALTER TABLE note_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own note chat messages" 
  ON note_chat_messages 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own note chat messages" 
  ON note_chat_messages 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own note chat messages" 
  ON note_chat_messages 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own note chat messages" 
  ON note_chat_messages 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Add index for better performance
CREATE INDEX idx_note_chat_messages_note_id_created_at ON note_chat_messages(note_id, created_at DESC);

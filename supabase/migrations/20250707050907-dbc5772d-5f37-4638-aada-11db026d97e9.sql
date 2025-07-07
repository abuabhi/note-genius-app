-- Create table for persisting content expansions
CREATE TABLE public.note_content_expansions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'original', 'summary', 'key_points', 'improved_content', 'enriched_content'
  original_text TEXT NOT NULL,
  expanded_content TEXT NOT NULL,
  position_marker TEXT NOT NULL, -- Unique identifier for position in content
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.note_content_expansions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage their own expansions
CREATE POLICY "Users can manage their own content expansions" 
ON public.note_content_expansions 
FOR ALL 
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_note_content_expansions_note_content 
ON public.note_content_expansions(note_id, content_type);

CREATE INDEX idx_note_content_expansions_user 
ON public.note_content_expansions(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_note_content_expansions_updated_at
BEFORE UPDATE ON public.note_content_expansions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
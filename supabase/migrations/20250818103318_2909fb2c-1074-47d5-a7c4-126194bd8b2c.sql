-- Create help_topic_sections table
CREATE TABLE public.help_topic_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  help_topic_id UUID NOT NULL REFERENCES public.help_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.help_topic_sections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active help topic sections" 
ON public.help_topic_sections 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.help_topics 
  WHERE help_topics.id = help_topic_sections.help_topic_id 
  AND help_topics.is_active = true
));

CREATE POLICY "DEAN users can manage help topic sections" 
ON public.help_topic_sections 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.user_tier = 'DEAN'
));

-- Add trigger for updated_at
CREATE TRIGGER update_help_topic_sections_updated_at
BEFORE UPDATE ON public.help_topic_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing help topics content to sections
INSERT INTO public.help_topic_sections (help_topic_id, title, content, sort_order)
SELECT 
  id as help_topic_id,
  'Overview' as title,
  content,
  0 as sort_order
FROM public.help_topics
WHERE content IS NOT NULL AND content != '';

-- Remove content column from help_topics as it's now in sections
ALTER TABLE public.help_topics DROP COLUMN content;
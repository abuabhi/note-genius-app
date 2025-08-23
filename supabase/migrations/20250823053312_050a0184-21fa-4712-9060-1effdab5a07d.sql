-- Create the resources table for bookmarking external resources
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'youtube_video',
    'article',
    'pdf_document', 
    'website',
    'research_paper',
    'lecture_recording',
    'textbook',
    'reference_site',
    'dictionary',
    'calculator',
    'syllabus',
    'assignment_sheet',
    'rubric'
  )),
  subject_id UUID REFERENCES public.user_subjects(id),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  thumbnail_url TEXT,
  author TEXT,
  duration_minutes INTEGER, -- for videos/audio content
  file_size_mb NUMERIC, -- for downloadable content
  language TEXT DEFAULT 'en',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}', -- for additional extracted metadata
  access_count INTEGER NOT NULL DEFAULT 0, -- track usage
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own resources
CREATE POLICY "Users can view their own resources"
  ON public.resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resources" 
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
  ON public.resources FOR UPDATE  
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON public.resources FOR DELETE
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX idx_resources_user_id ON public.resources(user_id);
CREATE INDEX idx_resources_user_type ON public.resources(user_id, resource_type);
CREATE INDEX idx_resources_user_subject ON public.resources(user_id, subject_id);
CREATE INDEX idx_resources_user_favorite ON public.resources(user_id, is_favorite);
CREATE INDEX idx_resources_user_created ON public.resources(user_id, created_at DESC);
CREATE INDEX idx_resources_title_search ON public.resources USING gin(to_tsvector('english', title));
CREATE INDEX idx_resources_description_search ON public.resources USING gin(to_tsvector('english', description));

-- Add updated_at trigger
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
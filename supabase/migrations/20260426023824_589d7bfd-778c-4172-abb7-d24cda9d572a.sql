-- Exams
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES public.user_subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  notes TEXT,
  target_readiness INTEGER NOT NULL DEFAULT 80 CHECK (target_readiness BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','completed','archived')),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  study_plan_id UUID REFERENCES public.study_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_exams_user_date ON public.exams(user_id, exam_date);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exams" ON public.exams FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own exams" ON public.exams FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own exams" ON public.exams FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own exams" ON public.exams FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Exam Topics
CREATE TABLE public.exam_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight > 0),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','learning','reviewing','confident')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_exam_topics_exam_pos ON public.exam_topics(exam_id, position);
CREATE INDEX idx_exam_topics_user ON public.exam_topics(user_id);
ALTER TABLE public.exam_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exam topics" ON public.exam_topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own exam topics" ON public.exam_topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own exam topics" ON public.exam_topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own exam topics" ON public.exam_topics FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_exam_topics_updated_at BEFORE UPDATE ON public.exam_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Exam Topic Links (polymorphic links to existing resources)
CREATE TABLE public.exam_topic_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.exam_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('note','flashcard_set','quiz','goal','todo')),
  resource_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (topic_id, resource_type, resource_id)
);
CREATE INDEX idx_exam_topic_links_topic ON public.exam_topic_links(topic_id);
CREATE INDEX idx_exam_topic_links_user ON public.exam_topic_links(user_id);
ALTER TABLE public.exam_topic_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own topic links" ON public.exam_topic_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own topic links" ON public.exam_topic_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topic links" ON public.exam_topic_links FOR DELETE USING (auth.uid() = user_id);

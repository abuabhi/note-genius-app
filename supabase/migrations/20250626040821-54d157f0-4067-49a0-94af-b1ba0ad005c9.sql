
-- Create curriculum topics table to store predefined topics by grade and subject
CREATE TABLE public.curriculum_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_level text NOT NULL,
  subject_name text NOT NULL,
  topic_name text NOT NULL,
  topic_description text,
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  prerequisites text[],
  related_topics text[],
  learning_objectives text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_curriculum_topics_grade_subject ON public.curriculum_topics(grade_level, subject_name);
CREATE INDEX idx_curriculum_topics_subject ON public.curriculum_topics(subject_name);
CREATE INDEX idx_curriculum_topics_topic_name ON public.curriculum_topics(topic_name);

-- Create user topic progress table to track what topics users have covered
CREATE TABLE public.user_topic_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subject_name text NOT NULL,
  topic_name text NOT NULL,
  progress_type text NOT NULL CHECK (progress_type IN ('note', 'flashcard', 'quiz')),
  resource_count integer DEFAULT 1,
  last_activity_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, subject_name, topic_name, progress_type)
);

-- Create indexes for user topic progress
CREATE INDEX idx_user_topic_progress_user_subject ON public.user_topic_progress(user_id, subject_name);
CREATE INDEX idx_user_topic_progress_user ON public.user_topic_progress(user_id);

-- Create topic suggestions cache table for performance
CREATE TABLE public.topic_suggestions_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subject_name text NOT NULL,
  suggestions jsonb NOT NULL,
  expires_at timestamp with time zone DEFAULT (now() + interval '24 hours'),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, subject_name)
);

-- Create index for suggestions cache
CREATE INDEX idx_topic_suggestions_cache_user_subject ON public.topic_suggestions_cache(user_id, subject_name);
CREATE INDEX idx_topic_suggestions_cache_expires ON public.topic_suggestions_cache(expires_at);

-- Enable RLS on all tables
ALTER TABLE public.curriculum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_suggestions_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies for curriculum_topics (publicly readable)
CREATE POLICY "Curriculum topics are publicly readable" 
  ON public.curriculum_topics 
  FOR SELECT 
  TO authenticated
  USING (true);

-- RLS policies for user_topic_progress
CREATE POLICY "Users can view their own topic progress" 
  ON public.user_topic_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own topic progress" 
  ON public.user_topic_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topic progress" 
  ON public.user_topic_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for topic_suggestions_cache
CREATE POLICY "Users can view their own suggestions cache" 
  ON public.topic_suggestions_cache 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own suggestions cache" 
  ON public.topic_suggestions_cache 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions cache" 
  ON public.topic_suggestions_cache 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert sample curriculum data for Mathematics Grade 10
INSERT INTO public.curriculum_topics (grade_level, subject_name, topic_name, topic_description, difficulty_level, prerequisites, related_topics, learning_objectives) VALUES
('Grade 10', 'Mathematics', 'Trigonometry', 'Study of triangles and their relationships', 3, ARRAY['Geometry', 'Algebra'], ARRAY['Circles', 'Coordinate Geometry', 'Functions'], ARRAY['Understand sine, cosine, tangent', 'Solve trigonometric equations']),
('Grade 10', 'Mathematics', 'Parabolas', 'Quadratic functions and their graphs', 3, ARRAY['Algebra', 'Functions'], ARRAY['Trigonometry', 'Coordinate Geometry', 'Polynomials'], ARRAY['Graph quadratic functions', 'Find vertex and roots']),
('Grade 10', 'Mathematics', 'Linear Functions', 'Straight line relationships', 2, ARRAY['Algebra'], ARRAY['Coordinate Geometry', 'Systems of Equations'], ARRAY['Graph linear functions', 'Find slope and intercepts']),
('Grade 10', 'Mathematics', 'Coordinate Geometry', 'Geometry on coordinate plane', 3, ARRAY['Algebra', 'Geometry'], ARRAY['Linear Functions', 'Parabolas', 'Circles'], ARRAY['Distance formula', 'Midpoint formula']),
('Grade 10', 'Mathematics', 'Polynomials', 'Algebraic expressions with multiple terms', 3, ARRAY['Algebra'], ARRAY['Parabolas', 'Factoring'], ARRAY['Add, subtract, multiply polynomials', 'Factor polynomials']),
('Grade 10', 'Mathematics', 'Systems of Equations', 'Solving multiple equations simultaneously', 3, ARRAY['Linear Functions', 'Algebra'], ARRAY['Matrices', 'Coordinate Geometry'], ARRAY['Solve by substitution', 'Solve by elimination']),
('Grade 10', 'Mathematics', 'Circles', 'Properties and equations of circles', 3, ARRAY['Coordinate Geometry'], ARRAY['Trigonometry', 'Area and Perimeter'], ARRAY['Circle equations', 'Tangent and chord properties']),
('Grade 10', 'Mathematics', 'Statistics', 'Data analysis and interpretation', 2, ARRAY['Basic Math'], ARRAY['Probability'], ARRAY['Mean, median, mode', 'Standard deviation']),
('Grade 10', 'Mathematics', 'Probability', 'Likelihood of events', 2, ARRAY['Basic Math'], ARRAY['Statistics', 'Combinations'], ARRAY['Basic probability rules', 'Conditional probability']),
('Grade 10', 'Mathematics', 'Factoring', 'Breaking down algebraic expressions', 2, ARRAY['Algebra'], ARRAY['Polynomials', 'Quadratic Functions'], ARRAY['Factor by grouping', 'Difference of squares']);

-- Insert sample data for Science Grade 10
INSERT INTO public.curriculum_topics (grade_level, subject_name, topic_name, topic_description, difficulty_level, prerequisites, related_topics, learning_objectives) VALUES
('Grade 10', 'Science', 'Cell Biology', 'Structure and function of cells', 2, ARRAY['Basic Biology'], ARRAY['Genetics', 'Human Body Systems'], ARRAY['Cell organelles', 'Cell division']),
('Grade 10', 'Science', 'Genetics', 'Heredity and DNA', 3, ARRAY['Cell Biology'], ARRAY['Evolution', 'Biotechnology'], ARRAY['DNA structure', 'Mendelian genetics']),
('Grade 10', 'Science', 'Chemistry Basics', 'Atoms, molecules, and reactions', 2, ARRAY['Basic Chemistry'], ARRAY['Chemical Bonding', 'Acids and Bases'], ARRAY['Periodic table', 'Chemical formulas']),
('Grade 10', 'Science', 'Physics Motion', 'Movement and forces', 3, ARRAY['Basic Physics'], ARRAY['Energy', 'Waves'], ARRAY['Newtons laws', 'Velocity and acceleration']),
('Grade 10', 'Science', 'Energy', 'Forms and conservation of energy', 3, ARRAY['Physics Motion'], ARRAY['Waves', 'Electricity'], ARRAY['Kinetic and potential energy', 'Energy transformations']);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_suggestions_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.topic_suggestions_cache 
  WHERE expires_at < now();
END;
$$;

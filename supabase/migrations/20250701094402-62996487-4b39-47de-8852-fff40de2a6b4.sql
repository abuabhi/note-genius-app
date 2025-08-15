
-- Phase 1: Enable RLS on all tables that need it
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Phase 2: Create policies for reference tables (countries, grades)
-- These should be publicly readable but admin-only writable

-- Countries policies
CREATE POLICY "Anyone can view countries" 
  ON public.countries 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify countries" 
  ON public.countries 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Grades policies
CREATE POLICY "Anyone can view grades" 
  ON public.grades 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify grades" 
  ON public.grades 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Phase 3: Create policies for shared tables (tags, sections)
-- Tags should be viewable by everyone, but only creatable by authenticated users
CREATE POLICY "Anyone can view tags" 
  ON public.tags 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage tags" 
  ON public.tags 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Sections policies - assuming these are content sections that should be publicly readable
CREATE POLICY "Anyone can view sections" 
  ON public.sections 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify sections" 
  ON public.sections 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_tier = 'DEAN'
    )
  );

-- Phase 4: Create policies for user-specific tables
-- Test sessions - users can only access their own test sessions
CREATE POLICY "Users can view their own test sessions" 
  ON public.test_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test sessions" 
  ON public.test_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test sessions" 
  ON public.test_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test sessions" 
  ON public.test_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Test question attempts - users can only access their own attempts
CREATE POLICY "Users can view their own test question attempts" 
  ON public.test_question_attempts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions 
      WHERE id = test_question_attempts.test_session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own test question attempts" 
  ON public.test_question_attempts 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions 
      WHERE id = test_question_attempts.test_session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own test question attempts" 
  ON public.test_question_attempts 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions 
      WHERE id = test_question_attempts.test_session_id 
      AND user_id = auth.uid()
    )
  );

-- Learning progress - users can only access their own progress
CREATE POLICY "Users can view their own learning progress" 
  ON public.learning_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning progress" 
  ON public.learning_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" 
  ON public.learning_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning progress" 
  ON public.learning_progress 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Phase 5: Create policies for junction tables (note_tags)
-- Junction table should follow the access pattern of the parent note
CREATE POLICY "Users can view note tags for their own notes" 
  ON public.note_tags 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.notes 
      WHERE id = note_tags.note_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create note tags for their own notes" 
  ON public.note_tags 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.notes 
      WHERE id = note_tags.note_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update note tags for their own notes" 
  ON public.note_tags 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.notes 
      WHERE id = note_tags.note_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete note tags for their own notes" 
  ON public.note_tags 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.notes 
      WHERE id = note_tags.note_id 
      AND user_id = auth.uid()
    )
  );

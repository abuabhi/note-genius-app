
-- Create study_plans table
CREATE TABLE public.study_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_hours_per_week INTEGER NOT NULL DEFAULT 0,
  preferred_session_duration INTEGER NOT NULL DEFAULT 60, -- minutes
  available_days JSONB NOT NULL DEFAULT '[]'::jsonb, -- ["monday", "tuesday", etc.]
  available_times JSONB NOT NULL DEFAULT '{}'::jsonb, -- {"monday": {"start": "09:00", "end": "17:00"}}
  topics JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{"name": "Topic 1", "priority": "high", "estimated_hours": 5}]
  difficulty_level TEXT NOT NULL DEFAULT 'intermediate', -- beginner, intermediate, advanced
  study_style TEXT NOT NULL DEFAULT 'mixed', -- focused, mixed, review-heavy
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, completed, archived
  is_converted_to_goals BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_plan_sessions table
CREATE TABLE public.study_plan_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  study_plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'study', -- study, review, practice, break
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, skipped, rescheduled
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  performance_rating INTEGER, -- 1-5 rating
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create plan_templates table for reusable templates
CREATE TABLE public.plan_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- NULL for system templates
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_templates ENABLE ROW LEVEL SECURITY;

-- Study plans policies
CREATE POLICY "Users can view their own study plans" 
  ON public.study_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study plans" 
  ON public.study_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans" 
  ON public.study_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans" 
  ON public.study_plans FOR DELETE 
  USING (auth.uid() = user_id);

-- Study plan sessions policies
CREATE POLICY "Users can view their own study plan sessions" 
  ON public.study_plan_sessions FOR SELECT 
  USING (auth.uid() = (SELECT user_id FROM public.study_plans WHERE id = study_plan_id));

CREATE POLICY "Users can create their own study plan sessions" 
  ON public.study_plan_sessions FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.study_plans WHERE id = study_plan_id));

CREATE POLICY "Users can update their own study plan sessions" 
  ON public.study_plan_sessions FOR UPDATE 
  USING (auth.uid() = (SELECT user_id FROM public.study_plans WHERE id = study_plan_id));

CREATE POLICY "Users can delete their own study plan sessions" 
  ON public.study_plan_sessions FOR DELETE 
  USING (auth.uid() = (SELECT user_id FROM public.study_plans WHERE id = study_plan_id));

-- Plan templates policies
CREATE POLICY "Users can view public templates and their own templates" 
  ON public.plan_templates FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" 
  ON public.plan_templates FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" 
  ON public.plan_templates FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" 
  ON public.plan_templates FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_study_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON public.study_plans
  FOR EACH ROW EXECUTE FUNCTION update_study_plans_updated_at();

CREATE TRIGGER update_study_plan_sessions_updated_at
  BEFORE UPDATE ON public.study_plan_sessions
  FOR EACH ROW EXECUTE FUNCTION update_study_plans_updated_at();

CREATE TRIGGER update_plan_templates_updated_at
  BEFORE UPDATE ON public.plan_templates
  FOR EACH ROW EXECUTE FUNCTION update_study_plans_updated_at();

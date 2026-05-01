-- gantt_plans table
CREATE TABLE public.gantt_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_id UUID NULL REFERENCES public.exams(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gantt_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_plans FORCE ROW LEVEL SECURITY;

CREATE INDEX idx_gantt_plans_user ON public.gantt_plans(user_id);
CREATE INDEX idx_gantt_plans_exam ON public.gantt_plans(exam_id);

CREATE POLICY "Users select own gantt plans" ON public.gantt_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own gantt plans" ON public.gantt_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own gantt plans" ON public.gantt_plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own gantt plans" ON public.gantt_plans
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_gantt_plans_updated_at
  BEFORE UPDATE ON public.gantt_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- gantt_tasks table
CREATE TABLE public.gantt_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.gantt_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID NULL REFERENCES public.gantt_tasks(id) ON DELETE SET NULL,
  topic_id UUID NULL REFERENCES public.exam_topics(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'task',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  dependencies UUID[] NOT NULL DEFAULT '{}',
  hide_children BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gantt_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_tasks FORCE ROW LEVEL SECURITY;

CREATE INDEX idx_gantt_tasks_plan ON public.gantt_tasks(plan_id);
CREATE INDEX idx_gantt_tasks_user ON public.gantt_tasks(user_id);
CREATE INDEX idx_gantt_tasks_topic ON public.gantt_tasks(topic_id);

CREATE POLICY "Users select own gantt tasks" ON public.gantt_tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own gantt tasks" ON public.gantt_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own gantt tasks" ON public.gantt_tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own gantt tasks" ON public.gantt_tasks
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_gantt_tasks_updated_at
  BEFORE UPDATE ON public.gantt_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
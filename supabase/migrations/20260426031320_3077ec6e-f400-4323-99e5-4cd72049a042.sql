
CREATE TABLE public.admin_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_todos_status ON public.admin_todos(status);
CREATE INDEX idx_admin_todos_due_date ON public.admin_todos(due_date);

ALTER TABLE public.admin_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deans can view admin todos"
  ON public.admin_todos FOR SELECT
  USING (public.is_dean_user(auth.uid()));

CREATE POLICY "Deans can insert admin todos"
  ON public.admin_todos FOR INSERT
  WITH CHECK (public.is_dean_user(auth.uid()) AND auth.uid() = created_by);

CREATE POLICY "Deans can update admin todos"
  ON public.admin_todos FOR UPDATE
  USING (public.is_dean_user(auth.uid()));

CREATE POLICY "Deans can delete admin todos"
  ON public.admin_todos FOR DELETE
  USING (public.is_dean_user(auth.uid()));

CREATE OR REPLACE FUNCTION public.admin_todos_set_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at = now();
  ELSIF NEW.status <> 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_todos_before_update
  BEFORE UPDATE ON public.admin_todos
  FOR EACH ROW
  EXECUTE FUNCTION public.admin_todos_set_timestamps();

CREATE OR REPLACE FUNCTION public.admin_todos_set_initial()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'done' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_todos_before_insert
  BEFORE INSERT ON public.admin_todos
  FOR EACH ROW
  EXECUTE FUNCTION public.admin_todos_set_initial();

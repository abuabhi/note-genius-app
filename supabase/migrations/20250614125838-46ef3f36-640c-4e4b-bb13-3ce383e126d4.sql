
-- Add new columns to study_goals table for overdue goal management
ALTER TABLE public.study_goals 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived', 'completed')),
ADD COLUMN IF NOT EXISTS grace_period_days integer DEFAULT 7,
ADD COLUMN IF NOT EXISTS extension_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS archived_reason text;

-- Add index for efficient overdue goal queries
CREATE INDEX IF NOT EXISTS idx_study_goals_status_end_date ON public.study_goals(status, end_date);

-- Update existing goals to have the new status
UPDATE public.study_goals 
SET status = CASE 
  WHEN is_completed = true THEN 'completed'
  ELSE 'active'
END
WHERE status IS NULL;

-- Create function to detect overdue goals
CREATE OR REPLACE FUNCTION public.get_overdue_goals(p_user_id uuid)
RETURNS TABLE(
  goal_id uuid,
  title text,
  end_date date,
  days_overdue integer,
  in_grace_period boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sg.id as goal_id,
    sg.title,
    sg.end_date,
    (CURRENT_DATE - sg.end_date)::integer as days_overdue,
    (CURRENT_DATE - sg.end_date)::integer <= sg.grace_period_days as in_grace_period
  FROM public.study_goals sg
  WHERE sg.user_id = p_user_id
    AND sg.status = 'active'
    AND sg.end_date < CURRENT_DATE
    AND sg.is_completed = false
  ORDER BY sg.end_date ASC;
END;
$$;

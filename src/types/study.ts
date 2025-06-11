
export interface StudyGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_hours: number;
  start_date: string;
  end_date: string;
  is_completed: boolean;
  progress: number;
  flashcard_set_id?: string;
  created_at: string;
  updated_at: string;
  subject: string;
}

export interface GoalFormValues {
  title: string;
  description?: string;
  target_hours: number;
  start_date: string;
  end_date: string;
  subject: string;
  flashcard_set_id?: string;
}

export interface GoalTemplate {
  title: string;
  description: string;
  target_hours: number;
  duration_days: number;
  subject?: string;
}

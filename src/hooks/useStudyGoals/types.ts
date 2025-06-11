
export type StudyGoal = {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  target_hours: number;
  progress: number;
  is_completed: boolean;
  start_date: string;
  end_date: string;
  flashcard_set_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type GoalFormValues = Omit<StudyGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'progress' | 'is_completed'> & {
  id?: string;
};

export type GoalTemplate = {
  title: string;
  description: string;
  target_hours: number;
  duration_days: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  subject?: string;
};

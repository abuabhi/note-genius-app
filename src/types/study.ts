
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
  subject?: string; // Make this optional to match database schema
  status?: 'active' | 'paused' | 'archived' | 'completed';
  grace_period_days?: number;
  extension_count?: number;
  archived_at?: string;
  archived_reason?: string;
}

export interface GoalFormValues {
  id?: string; // Add optional id for editing scenarios
  title: string;
  description?: string;
  target_hours: number;
  start_date: string;
  end_date: string;
  subject?: string; // Make this optional to match the StudyGoal interface
  flashcard_set_id?: string;
}

export interface GoalTemplate {
  title: string;
  description: string;
  target_hours: number;
  duration_days: number;
  subject?: string;
}

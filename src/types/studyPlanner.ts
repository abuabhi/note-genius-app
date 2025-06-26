
export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject: string;
  topic: string;
  total_duration_hours: number;
  start_date: string;
  end_date: string;
  preferred_times: Record<string, any>;
  study_days: string[];
  daily_duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  learning_objectives?: string[];
  session_duration_minutes: number;
  break_duration_minutes: number;
  max_sessions_per_day: number;
  completion_percentage: number;
  current_topic_index: number;
  sessions_completed: number;
  can_convert_to_goals: boolean;
  related_flashcard_sets?: string[];
  related_notes?: string[];
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  is_converted_to_goals: boolean;
  status: 'active' | 'completed' | 'paused' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface StudyPlanSession {
  id: string;
  study_plan_id: string;
  title: string;
  description?: string;
  topic?: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  duration_minutes: number;
  actual_start_time?: string;
  actual_end_time?: string;
  session_type: 'study' | 'review' | 'practice' | 'break';
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  completion_notes?: string;
  performance_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateStudyPlanData {
  title: string;
  description?: string;
  subject: string;
  topic: string;
  total_duration_hours: number;
  start_date: string;
  end_date: string;
  preferred_times: Record<string, any>;
  study_days: string[];
  daily_duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  learning_objectives?: string[];
  session_duration_minutes: number;
  break_duration_minutes: number;
  max_sessions_per_day: number;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  related_flashcard_sets?: string[];
  related_notes?: string[];
}

export interface StudyPlanFormValues {
  title: string;
  description: string;
  subject: string;
  topic: string;
  totalHours: number;
  startDate: string;
  endDate: string;
  dailyDurationMinutes: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  sessionDuration: number;
  breakDuration: number;
  maxSessionsPerDay: number;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  studyDays: string[];
  preferredTimes: string[];
}

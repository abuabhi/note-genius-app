
export interface StudyPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject: string;
  start_date: string;
  end_date: string;
  total_hours_per_week: number;
  preferred_session_duration: number;
  available_days: string[];
  available_times: Record<string, { start: string; end: string }>;
  topics: StudyTopic[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  study_style: 'focused' | 'mixed' | 'review-heavy';
  status: 'active' | 'paused' | 'completed' | 'archived';
  is_converted_to_goals: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyTopic {
  name: string;
  priority: 'low' | 'medium' | 'high';
  estimated_hours: number;
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
  session_type: 'study' | 'review' | 'practice' | 'break';
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped' | 'rescheduled';
  actual_start_time?: string;
  actual_end_time?: string;
  completion_notes?: string;
  performance_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface PlanTemplate {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  subject: string;
  template_data: any;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface StudyPlanFormData {
  title: string;
  description?: string;
  subject: string;
  start_date: string;
  end_date: string;
  total_hours_per_week: number;
  preferred_session_duration: number;
  available_days: string[];
  available_times: Record<string, { start: string; end: string }>;
  topics: StudyTopic[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  study_style: 'focused' | 'mixed' | 'review-heavy';
}

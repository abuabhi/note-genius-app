
export interface CurriculumTopic {
  id: string;
  grade_level: string;
  subject_name: string;
  topic_name: string;
  topic_description?: string;
  difficulty_level: number;
  prerequisites: string[];
  related_topics: string[];
  learning_objectives: string[];
  created_at: string;
  updated_at: string;
}

export interface UserTopicProgress {
  id: string;
  user_id: string;
  subject_name: string;
  topic_name: string;
  progress_type: 'note' | 'flashcard' | 'quiz';
  resource_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface TopicSuggestion {
  topic_name: string;
  topic_description?: string;
  difficulty_level: number;
  reason: string;
  confidence_score: number;
  suggested_resources: ('note' | 'flashcard' | 'quiz')[];
  prerequisites_met: boolean;
  related_to: string[];
}

export interface TopicSuggestionsResponse {
  subject_name: string;
  user_grade: string;
  suggestions: TopicSuggestion[];
  cached_at?: string;
  expires_at?: string;
}

export type SuggestionReason = 
  | 'prerequisite_completed'
  | 'related_topic'
  | 'difficulty_progression'
  | 'curriculum_sequence'
  | 'popular_combination';

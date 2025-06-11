
export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  subject_id: string | null; // Changed from category_id to subject_id
  section_id: string | null;
  grade_id: string | null;
  source_type: 'prebuilt' | 'note' | 'custom';
  source_id: string | null;
  user_id: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';
  explanation: string | null;
  difficulty: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface QuizOption {
  id: string;
  question_id: string;
  content: string;
  is_correct: boolean;
  position: number;
}

export interface QuizResult {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  duration_seconds: number | null;
  completed_at: string;
  created_at: string;
}

export interface QuizQuestionResponse {
  id: string;
  result_id: string;
  question_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
  time_spent_seconds: number | null;
}

export interface QuizWithQuestions extends Quiz {
  questions: (QuizQuestion & {
    options: QuizOption[];
  })[];
}

export interface CSVQuizRow {
  quiz_title: string;
  quiz_description?: string;
  subject_name: string;
  grade_name?: string;
  section_name?: string;
  question: string;
  correct_option: string;
  option2: string;
  option3?: string;
  option4?: string;
  explanation?: string;
  difficulty?: string;
}

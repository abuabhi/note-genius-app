
export interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  is_built_in?: boolean;
  card_count?: number;
  subject?: string;
  topic?: string;
  country_id?: string;
  category_id?: string;
  education_system?: string;
  section_id?: string;
  subject_categories?: {
    id?: string;
    name?: string;
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  // New fields for database mapping
  front_content: string;
  back_content: string;
  set_id?: string;
  created_at?: string;
  updated_at?: string;
  hint?: string;
  image_url?: string;
  audio_url?: string;
  position?: number;
  difficulty?: number;
  user_id?: string;
  is_built_in?: boolean;
  last_reviewed_at?: string;
  next_review_at?: string;
}

export interface FlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  last_reviewed_at: string;
  next_review_at: string;
  repetition: number;
  ease_factor: number;
  interval: number;
  last_score: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export type FlashcardScore = 0 | 1 | 2 | 3 | 4 | 5;

export type FlashcardDifficulty = 1 | 2 | 3 | 4 | 5;

export interface CreateFlashcardPayload {
  front_content: string;
  back_content: string;
  set_id?: string;
  difficulty?: FlashcardDifficulty;
  hint?: string;
  image_url?: string;
  audio_url?: string;
}

export interface CreateFlashcardSetPayload {
  name: string;
  description?: string;
  subject?: string;
  topic?: string;
  is_public?: boolean;
  is_built_in?: boolean;
  category_id?: string;
  country_id?: string;
}

export interface SubjectCategory {
  id: string;
  name: string;
  parent_id?: string;
  level?: number;
  grade_id?: string;
  country_id?: string;
  education_system?: string;
  created_at?: string;
  updated_at?: string;
  subcategories?: SubjectCategory[];
}

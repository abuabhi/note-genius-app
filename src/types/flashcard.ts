
export type FlashcardDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Flashcard {
  id: string;
  front_content: string;
  back_content: string;
  difficulty: FlashcardDifficulty;
  created_at: string;
  updated_at: string;
  is_built_in: boolean;
  last_reviewed_at?: string;
  next_review_at?: string;
}

export interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_built_in: boolean;
  category_id?: string;
  subject?: string;
  topic?: string;
  card_count?: number; // Computed field for UI
}

export interface FlashcardSetCard {
  id: string;
  flashcard_id: string;
  set_id: string;
  position: number;
  created_at: string;
  flashcard?: Flashcard; // For eager loading
}

export interface FlashcardProgress {
  id: string;
  flashcard_id: string;
  ease_factor: number;
  interval: number;
  repetition: number;
  last_reviewed_at?: string;
  next_review_at?: string;
  last_score?: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectCategory {
  id: string;
  name: string;
  parent_id?: string;
  level: number;
  created_at: string;
  updated_at: string;
  subcategories?: SubjectCategory[]; // For hierarchical display
}

export type FlashcardScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface CreateFlashcardPayload {
  front_content: string;
  back_content: string;
  difficulty?: FlashcardDifficulty;
}

export interface CreateFlashcardSetPayload {
  name: string;
  description?: string;
  subject?: string;
  topic?: string;
  category_id?: string;
}

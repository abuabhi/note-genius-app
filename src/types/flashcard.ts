
export interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  card_count?: number;
  subject_categories?: {
    id?: string;
    name?: string;
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  set_id?: string;
  created_at?: string;
  updated_at?: string;
  hint?: string;
  image_url?: string;
  audio_url?: string;
  position?: number;
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

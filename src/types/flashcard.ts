
export interface SubjectCategory {
  id: string;
  name: string;
  grade_id?: string;
  parent_id?: string | null;
  level?: number;
  created_at?: string;
  updated_at?: string;
  description?: string | null;
}

export interface FlashcardSet {
  id: string;
  name: string;
  description?: string | null;
  user_id?: string | null;
  category_id?: string | null;
  section_id?: string | null;
  subject?: string | null;
  topic?: string | null;
  created_at: string;
  updated_at: string;
  is_built_in?: boolean;
  cards_count?: number;
}

export interface Flashcard {
  id: string;
  front_content: string;
  back_content: string;
  difficulty?: number;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string | null;
  next_review_at?: string | null;
  is_built_in?: boolean;
  position?: number; // Used when part of a set
}

export interface FlashcardProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  last_reviewed_at: string | null;
  next_review_at: string | null;
  interval: number;
  repetition: number;
  ease_factor: number;
  last_score: number | null;
}

export enum StudyMode {
  LEARN = 'learn',
  REVIEW = 'review',
  TEST = 'test',
}

export interface FlashcardTag {
  id: string;
  name: string;
  color?: string;
}

export interface LibraryFilter {
  grades?: string[];
  subjects?: string[];
  sections?: string[];
  searchTerm?: string;
}

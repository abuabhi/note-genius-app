
import { User } from '@supabase/supabase-js';
import { FlashcardSet, Flashcard, SubjectCategory, CreateFlashcardSetPayload } from '@/types/flashcard';

export interface FlashcardState {
  flashcards: Flashcard[];
  flashcardSets: FlashcardSet[];
  currentFlashcard: Flashcard | null;
  currentSet: FlashcardSet | null;
  categories: SubjectCategory[];
  loading: {
    flashcards: boolean;
    sets: boolean;
    categories: boolean;
  };
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  setFlashcardSets: React.Dispatch<React.SetStateAction<FlashcardSet[]>>;
  setCurrentFlashcard: React.Dispatch<React.SetStateAction<Flashcard | null>>;
  setCurrentSet: React.Dispatch<React.SetStateAction<FlashcardSet | null>>;
  setCategories: React.Dispatch<React.SetStateAction<SubjectCategory[]>>;
  setLoading: React.Dispatch<React.SetStateAction<{
    flashcards: boolean;
    sets: boolean;
    categories: boolean;
  }>>;
  user: User | null;
}

export interface FlashcardContextType extends FlashcardState {
  // Core operations
  fetchFlashcards: (filters?: { setId?: string }) => Promise<Flashcard[]>;
  createFlashcard: (cardData: any) => Promise<Flashcard | null>;
  addFlashcard: (flashcardData: any) => Promise<Flashcard>;
  updateFlashcard: (id: string, cardData: any) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  removeFlashcardFromSet: (flashcardId: string, setId: string) => Promise<void>;
  addFlashcardToSet: (flashcardId: string, setId: string, position?: number) => Promise<void>;
  
  // Set operations
  fetchFlashcardSets: () => Promise<FlashcardSet[]>;
  createFlashcardSet: (setData: CreateFlashcardSetPayload) => Promise<FlashcardSet | null>;
  updateFlashcardSet: (id: string, setData: Partial<CreateFlashcardSetPayload>) => Promise<void>;
  deleteFlashcardSet: (id: string) => Promise<void>;
  fetchFlashcardsInSet: (setId: string) => Promise<Flashcard[]>;
  fetchBuiltInSets: () => Promise<FlashcardSet[]>;
  
  // Category operations
  fetchCategories: () => Promise<SubjectCategory[]>;
  createCategory: (name: string, parentId?: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Library operations
  searchLibrary: (query: string) => Promise<FlashcardSet[]>;
  copySetFromLibrary: (setId: string) => Promise<FlashcardSet | null>;
  cloneFlashcardSet: (setId: string) => Promise<FlashcardSet | null>;
  
  // Study operations
  recordFlashcardReview: (flashcardId: string, quality: number) => Promise<void>;
  getFlashcardProgress: (flashcardId: string) => Promise<any>;
  
  // Loading states
  isLoading: boolean;
  
  // Ready state - indicates when provider is ready to use
  isReady?: boolean;
}

export interface FlashcardProviderProps {
  children: React.ReactNode;
}


import { 
  Flashcard, 
  FlashcardSet, 
  CreateFlashcardPayload, 
  CreateFlashcardSetPayload, 
  FlashcardScore, 
  FlashcardProgress, 
  SubjectCategory
} from '@/types/flashcard';

export interface FlashcardContextType {
  // Data
  flashcards: Flashcard[];
  flashcardSets: FlashcardSet[];
  currentFlashcard: Flashcard | null;
  currentSet: FlashcardSet | null;
  categories: SubjectCategory[];
  setCategories: React.Dispatch<React.SetStateAction<SubjectCategory[]>>;
  
  // Loading states
  loading: {
    flashcards: boolean;
    sets: boolean;
    categories: boolean;
  };

  // Set operations
  fetchFlashcardSets: () => Promise<void>;
  createFlashcardSet: (setData: CreateFlashcardSetPayload) => Promise<FlashcardSet | null>;
  updateFlashcardSet: (id: string, setData: Partial<CreateFlashcardSetPayload>) => Promise<void>;
  deleteFlashcardSet: (id: string) => Promise<void>;
  fetchFlashcardsInSet: (setId: string) => Promise<Flashcard[]>;
  
  // Flashcard operations
  fetchFlashcards: () => Promise<void>;
  createFlashcard: (cardData: CreateFlashcardPayload, setId?: string) => Promise<Flashcard | null>;
  updateFlashcard: (id: string, cardData: Partial<CreateFlashcardPayload>) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  addFlashcardToSet: (flashcardId: string, setId: string, position?: number) => Promise<void>;
  removeFlashcardFromSet: (flashcardId: string, setId: string) => Promise<void>;
  
  // Study operations
  recordFlashcardReview: (flashcardId: string, score: FlashcardScore) => Promise<void>;
  getFlashcardProgress: (flashcardId: string) => Promise<FlashcardProgress | null>;
  
  // Category operations
  fetchCategories: () => Promise<SubjectCategory[]>;
  
  // Library operations
  fetchBuiltInSets: () => Promise<FlashcardSet[]>;
  cloneFlashcardSet: (setId: string) => Promise<FlashcardSet>;
  
  // Current states
  setCurrentFlashcard: (flashcard: Flashcard | null) => void;
  setCurrentSet: (set: FlashcardSet | null) => void;
}

export interface FlashcardProviderProps {
  children: React.ReactNode;
}

export interface FlashcardState {
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  flashcardSets: FlashcardSet[];
  setFlashcardSets: React.Dispatch<React.SetStateAction<FlashcardSet[]>>;
  categories: SubjectCategory[];
  setCategories: React.Dispatch<React.SetStateAction<SubjectCategory[]>>;
  currentFlashcard: Flashcard | null;
  setCurrentFlashcard: React.Dispatch<React.SetStateAction<Flashcard | null>>;
  currentSet: FlashcardSet | null;
  setCurrentSet: React.Dispatch<React.SetStateAction<FlashcardSet | null>>;
  loading: {
    flashcards: boolean;
    sets: boolean;
    categories: boolean;
  };
  setLoading: React.Dispatch<React.SetStateAction<{
    flashcards: boolean;
    sets: boolean;
    categories: boolean;
  }>>;
}

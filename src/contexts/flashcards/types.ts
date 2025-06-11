
import { User } from '@supabase/supabase-js';
import { FlashcardSet, Flashcard, AcademicSubject, CreateFlashcardSetPayload } from '@/types/flashcard';

export interface FlashcardState {
  flashcards: Flashcard[];
  flashcardSets: FlashcardSet[];
  currentFlashcard: Flashcard | null;
  currentSet: FlashcardSet | null;
  academicSubjects: AcademicSubject[]; // Changed from categories to academicSubjects
  loading: {
    flashcards: boolean;
    sets: boolean;
    academicSubjects: boolean; // Changed from categories to academicSubjects
  };
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
  setFlashcardSets: React.Dispatch<React.SetStateAction<FlashcardSet[]>>;
  setCurrentFlashcard: React.Dispatch<React.SetStateAction<Flashcard | null>>;
  setCurrentSet: React.Dispatch<React.SetStateAction<FlashcardSet | null>>;
  setAcademicSubjects: React.Dispatch<React.SetStateAction<AcademicSubject[]>>; // Changed from setCategories to setAcademicSubjects
  setLoading: React.Dispatch<React.SetStateAction<{
    flashcards: boolean;
    sets: boolean;
    academicSubjects: boolean; // Changed from categories to academicSubjects
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
  
  // Academic Subject operations (renamed from Category operations)
  fetchAcademicSubjects: () => Promise<AcademicSubject[]>; // Changed from fetchCategories
  createAcademicSubject: (name: string, parentId?: string) => Promise<void>; // Changed from createCategory
  updateAcademicSubject: (id: string, name: string) => Promise<void>; // Changed from updateCategory
  deleteAcademicSubject: (id: string) => Promise<void>; // Changed from deleteCategory
  
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

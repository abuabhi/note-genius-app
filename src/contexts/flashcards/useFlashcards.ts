
import { useFlashcardOperations } from './useFlashcardOperations';
import { useLibraryOperations } from './useLibraryOperations';
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';
import { FlashcardState } from './types';

export const useFlashcardsOperations = (
  state: FlashcardState
) => {
  const { 
    setFlashcardSets, 
    setLoading
  } = state;
  
  const { toast } = useToast();
  
  // Import operations from separate modules
  const flashcardOperations = useFlashcardOperations(state);
  const libraryOperations = useLibraryOperations(state);

  // Combine all operations
  return {
    ...flashcardOperations,
    ...libraryOperations,
  };
};

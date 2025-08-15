
import { FlashcardState, FlashcardContextType } from './types';
import { useFlashcardOperations } from './useFlashcardOperations';
import { useFlashcardSets } from './useFlashcardSets';
import { useUserSubjectOperations } from './useCategoryOperations';
import { useStudyOperations } from './useStudyOperations';
import { useLibraryOperations } from './useLibraryOperations';

export const combineFlashcardOperations = (state: FlashcardState): Omit<FlashcardContextType, keyof FlashcardState | 'isLoading' | 'isReady'> => {
  const flashcardOps = useFlashcardOperations(state);
  const setOps = useFlashcardSets(state);
  const subjectOps = useUserSubjectOperations(state.userSubjects, state.setUserSubjects);
  const studyOps = useStudyOperations(state);
  const libraryOps = useLibraryOperations(state);

  return {
    ...flashcardOps,
    ...setOps,
    ...subjectOps,
    ...studyOps,
    ...libraryOps,
  };
};

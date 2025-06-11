
import { FlashcardState, FlashcardContextType } from './types';
import { useFlashcardOperations } from './useFlashcardOperations';
import { useFlashcardSets } from './useFlashcardSets';
import { useAcademicSubjectOperations } from './useCategoryOperations';
import { useStudyOperations } from './useStudyOperations';
import { useLibraryOperations } from './useLibraryOperations';

export const combineFlashcardOperations = (state: FlashcardState): Omit<FlashcardContextType, keyof FlashcardState | 'isLoading' | 'isReady'> => {
  const flashcardOps = useFlashcardOperations(state);
  const setOps = useFlashcardSets(state);
  const subjectOps = useAcademicSubjectOperations(state.academicSubjects, state.setAcademicSubjects);
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

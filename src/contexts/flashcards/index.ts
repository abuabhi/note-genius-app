
// This file serves as the entry point for the flashcards context exports
// Main context components are exported from index.tsx to avoid circular imports
export { useFlashcardState } from './useFlashcardState';
export { useFlashcardOperations } from './useFlashcardOperations';
export { useFlashcardSets } from './useFlashcardSets';
export { useCategoryOperations } from './useCategoryOperations';
export { useStudyOperations } from './useStudyOperations';
export { useLibraryOperations } from './useLibraryOperations';
export { combineFlashcardOperations } from './useFlashcards';

// Export the main context components from the tsx file
export { FlashcardProvider, useFlashcards } from './index.tsx';

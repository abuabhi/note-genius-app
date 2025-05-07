
import { useState } from 'react';
import { Flashcard, FlashcardSet, SubjectCategory } from '@/types/flashcard';
import { FlashcardState } from './types';

export const useFlashcardState = (): FlashcardState => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [categories, setCategories] = useState<SubjectCategory[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState({
    flashcards: false,
    sets: false,
    categories: false,
  });

  return {
    flashcards,
    setFlashcards,
    flashcardSets,
    setFlashcardSets,
    categories,
    setCategories,
    currentFlashcard,
    setCurrentFlashcard,
    currentSet,
    setCurrentSet,
    loading,
    setLoading,
  };
};

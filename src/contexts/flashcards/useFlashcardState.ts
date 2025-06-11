
import { useState } from 'react';
import { Flashcard, FlashcardSet, AcademicSubject } from '@/types/flashcard';
import { FlashcardState } from './types';
import { useAuth } from '@/contexts/auth';

export const useFlashcardState = (): FlashcardState => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [academicSubjects, setAcademicSubjects] = useState<AcademicSubject[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState({
    flashcards: false,
    sets: false,
    academicSubjects: false,
  });
  
  const { user } = useAuth();

  return {
    flashcards,
    setFlashcards,
    flashcardSets,
    setFlashcardSets,
    academicSubjects,
    setAcademicSubjects,
    currentFlashcard,
    setCurrentFlashcard,
    currentSet,
    setCurrentSet,
    loading,
    setLoading,
    user
  };
};

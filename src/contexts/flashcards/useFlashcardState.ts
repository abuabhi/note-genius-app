
import { useState } from 'react';
import { Flashcard, FlashcardSet, UserSubject } from '@/types/flashcard';
import { FlashcardState } from './types';
import { useAuth } from '@/contexts/auth';

export const useFlashcardState = (): FlashcardState => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [userSubjects, setUserSubjects] = useState<UserSubject[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState<Flashcard | null>(null);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [loading, setLoading] = useState({
    flashcards: false,
    sets: false,
    userSubjects: false,
  });
  
  const { user } = useAuth();

  return {
    flashcards,
    setFlashcards,
    flashcardSets,
    setFlashcardSets,
    userSubjects,
    setUserSubjects,
    currentFlashcard,
    setCurrentFlashcard,
    currentSet,
    setCurrentSet,
    loading,
    setLoading,
    user
  };
};

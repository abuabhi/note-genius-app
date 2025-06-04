
import { useState, useCallback } from 'react';
import { useStudySessions } from '@/hooks/useStudySessions';
import { useAuth } from '@/contexts/auth';

interface StudySessionData {
  flashcardSetId: string;
  flashcardSetName: string;
  cardsStudied: number;
  timeSpent: number; // in minutes
}

export const useStudySessionTracking = () => {
  const [currentSession, setCurrentSession] = useState<{
    id: string;
    startTime: Date;
    flashcardSetId: string;
    flashcardSetName: string;
    cardsStudied: number;
  } | null>(null);
  
  const { startSession, endSession } = useStudySessions();
  const { user } = useAuth();

  const startStudySession = useCallback(async (flashcardSetId: string, flashcardSetName: string) => {
    if (!user) return null;

    try {
      const sessionData = {
        title: `Study Session: ${flashcardSetName}`,
        subject: 'Flashcards',
        flashcard_set_id: flashcardSetId,
        notes: `Studying flashcard set: ${flashcardSetName}`
      };

      const result = await startSession.mutateAsync(sessionData);
      
      const newSession = {
        id: result.id,
        startTime: new Date(),
        flashcardSetId,
        flashcardSetName,
        cardsStudied: 0
      };
      
      setCurrentSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Error starting study session:', error);
      return null;
    }
  }, [user, startSession]);

  const endStudySession = useCallback(async (cardsStudied: number) => {
    if (!currentSession) return;

    try {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60); // in minutes
      
      await endSession.mutateAsync({
        sessionId: currentSession.id,
        endTime,
        duration: duration * 60, // convert to seconds for database
        notes: `Completed studying ${cardsStudied} cards from ${currentSession.flashcardSetName}`,
        focusTime: duration * 60 // assume all time was focus time for simplicity
      });

      setCurrentSession(null);
      return { duration, cardsStudied };
    } catch (error) {
      console.error('Error ending study session:', error);
      setCurrentSession(null);
      return null;
    }
  }, [currentSession, endSession]);

  const updateCardsStudied = useCallback((count: number) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, cardsStudied: count } : null);
    }
  }, [currentSession]);

  return {
    currentSession,
    startStudySession,
    endStudySession,
    updateCardsStudied,
    isSessionActive: !!currentSession
  };
};


import { useState, useEffect, useCallback } from "react";
import { useTestSession } from "@/hooks/useTestSession";
import { Flashcard } from "@/types/flashcard";
import { StudyMode } from "@/pages/study/types";

interface UseTestSessionManagerProps {
  flashcards: Flashcard[];
  mode: StudyMode;
  setId: string;
  currentIndex: number;
  currentCard: Flashcard | null;
  handleNext: () => void;
}

export const useTestSessionManager = ({
  flashcards,
  mode,
  setId,
  currentIndex,
  currentCard,
  handleNext
}: UseTestSessionManagerProps) => {
  const {
    currentSession,
    startTestSession,
    recordQuestionAttempt,
    completeTestSession
  } = useTestSession();

  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [testCompleted, setTestCompleted] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Map<string, { answer: string; isCorrect: boolean }>>(new Map());

  // Initialize test session for test mode
  useEffect(() => {
    if (flashcards.length > 0 && mode === "test" && !currentSession && !testCompleted) {
      startTestSession(setId, flashcards.length);
      setQuestionStartTime(Date.now());
    }
  }, [flashcards, mode, setId, startTestSession, currentSession, testCompleted]);

  // Track question timing for test mode
  useEffect(() => {
    if (mode === "test") {
      setQuestionStartTime(Date.now());
    }
  }, [currentIndex, mode]);

  const handleTestAnswer = useCallback(async (answer: string, isCorrect: boolean) => {
    if (mode !== "test" || !currentSession || !currentCard) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    await recordQuestionAttempt(
      currentSession.id,
      currentCard.id,
      isCorrect,
      'multiple_choice',
      answer,
      timeSpent
    );

    // Store answer locally
    setTestAnswers(prev => new Map(prev.set(currentCard.id, { answer, isCorrect })));

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        handleNext();
      } else {
        // Test completed
        completeTestSession(currentSession.id);
        setTestCompleted(true);
      }
    }, 1500);
  }, [mode, currentSession, currentCard, questionStartTime, recordQuestionAttempt, currentIndex, flashcards.length, handleNext, completeTestSession]);

  const handleRetakeTest = useCallback(() => {
    setTestCompleted(false);
    setTestAnswers(new Map());
    window.location.reload(); // Simple reset - could be more elegant
  }, []);

  const handleBackToStudy = useCallback(() => {
    window.history.back(); // Navigate back to study selection
  }, []);

  const currentAnswer = currentCard ? testAnswers.get(currentCard.id) : undefined;
  const timeSpent = mode === "test" ? Math.round((Date.now() - questionStartTime) / 1000) : undefined;

  return {
    currentSession,
    testCompleted,
    testAnswers,
    currentAnswer,
    timeSpent,
    handleTestAnswer,
    handleRetakeTest,
    handleBackToStudy
  };
};

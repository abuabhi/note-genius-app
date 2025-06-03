
import { useState, useEffect, useCallback } from "react";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { Flashcard } from "@/types/flashcard";
import { StudyMode } from "@/pages/study/types";

interface UseLearnModeManagerProps {
  flashcards: Flashcard[];
  mode: StudyMode;
  currentCard: Flashcard | null;
  handleNext: () => void;
}

export const useLearnModeManager = ({
  flashcards,
  mode,
  currentCard,
  handleNext
}: UseLearnModeManagerProps) => {
  const {
    progressMap,
    fetchLearningProgress,
    updateLearningProgress,
    markAsKnown,
    markAsDifficult,
    getCardProgress
  } = useLearningProgress();

  // Initialize learning progress when flashcards load
  useEffect(() => {
    if (flashcards.length > 0 && mode === "learn") {
      const flashcardIds = flashcards.map(card => card.id);
      fetchLearningProgress(flashcardIds);
    }
  }, [flashcards, mode, fetchLearningProgress]);

  const handleLearnModeNext = useCallback(async () => {
    if (mode === "learn" && currentCard) {
      const currentProgress = getCardProgress(currentCard.id);
      if (currentProgress) {
        await updateLearningProgress(currentCard.id, true); // Assume correct for now
      }
    }
    handleNext();
  }, [mode, currentCard, getCardProgress, updateLearningProgress, handleNext]);

  const handleConfidenceChange = useCallback(async (level: number) => {
    if (mode === "learn" && currentCard) {
      await updateLearningProgress(currentCard.id, true, level);
    }
  }, [mode, currentCard, updateLearningProgress]);

  const currentProgress = currentCard && mode === "learn" ? getCardProgress(currentCard.id) : null;
  const isFirstTime = currentProgress?.times_seen === 0 || !currentProgress;

  return {
    progressMap,
    currentProgress,
    isFirstTime,
    handleLearnModeNext,
    handleConfidenceChange,
    markAsKnown,
    markAsDifficult
  };
};

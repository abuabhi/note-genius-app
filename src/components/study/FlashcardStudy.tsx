
import { StudyMode } from "@/pages/study/types";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FlashcardExplanation } from "./FlashcardExplanation";
import { StudyControls } from "./StudyControls";
import { isPremiumTier } from "@/utils/premiumFeatures";
import { useFlashcardStudy } from "./hooks/useFlashcardStudy";
import { FlashcardDisplay } from "./components/FlashcardDisplay";
import { StudyProgressDisplay } from "./components/StudyProgress";
import { StudyNavigation } from "./components/StudyNavigation";
import { StudyLoadingState, StudyErrorState, StudyEmptyState } from "./components/StudyStates";
import { LearnModeControls } from "./modes/LearnModeControls";
import { TestModeControls } from "./modes/TestModeControls";
import { TestResults } from "./modes/TestResults";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { useTestSession } from "@/hooks/useTestSession";
import { useEffect, useState } from "react";

interface FlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const FlashcardStudy = ({ setId, mode }: FlashcardStudyProps) => {
  const { userProfile } = useRequireAuth();
  const isPremium = isPremiumTier(userProfile?.user_tier);
  
  const {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    direction,
    streak,
    error,
    forceUpdate,
    handleNext,
    handlePrevious,
    handleFlip,
    handleScoreCard,
    setIsFlipped
  } = useFlashcardStudy({ setId, mode });

  const {
    progressMap,
    fetchLearningProgress,
    updateLearningProgress,
    markAsKnown,
    markAsDifficult,
    getCardProgress
  } = useLearningProgress();

  const {
    currentSession,
    startTestSession,
    recordQuestionAttempt,
    completeTestSession
  } = useTestSession();

  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [testCompleted, setTestCompleted] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Map<string, { answer: string; isCorrect: boolean }>>(new Map());

  // Initialize learning progress when flashcards load
  useEffect(() => {
    if (flashcards.length > 0 && mode === "learn") {
      const flashcardIds = flashcards.map(card => card.id);
      fetchLearningProgress(flashcardIds);
    }
  }, [flashcards, mode, fetchLearningProgress]);

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
  
  console.log("FlashcardStudy - Rendering with:", {
    flashcardsCount: flashcards.length,
    currentIndex,
    currentCard: flashcards[currentIndex],
    isLoading,
    error,
    mode
  });
  
  if (isLoading) {
    return <StudyLoadingState />;
  }
  
  if (error) {
    return <StudyErrorState error={error} />;
  }
  
  if (flashcards.length === 0) {
    return <StudyEmptyState />;
  }
  
  const currentCard = flashcards[currentIndex];
  
  if (!currentCard) {
    console.error("FlashcardStudy - No current card at index:", currentIndex);
    return <StudyErrorState error="Invalid card index" />;
  }

  const currentProgress = mode === "learn" ? getCardProgress(currentCard.id) : null;
  const isFirstTime = currentProgress?.times_seen === 0 || !currentProgress;

  // Test mode specific handlers
  const handleTestAnswer = async (answer: string, isCorrect: boolean) => {
    if (mode !== "test" || !currentSession) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    await recordQuestionAttempt(
      currentSession.id,
      currentCard.id,
      isCorrect,
      'multiple_choice', // For now, defaulting to multiple choice
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
  };

  const handleLearnModeNext = async () => {
    if (mode === "learn" && currentProgress) {
      await updateLearningProgress(currentCard.id, true); // Assume correct for now
    }
    handleNext();
  };

  const handleConfidenceChange = async (level: number) => {
    if (mode === "learn") {
      await updateLearningProgress(currentCard.id, true, level);
    }
  };

  const handleRetakeTest = () => {
    setTestCompleted(false);
    setTestAnswers(new Map());
    window.location.reload(); // Simple reset - could be more elegant
  };

  const handleBackToStudy = () => {
    window.history.back(); // Navigate back to study selection
  };

  // Show test results if test is completed
  if (mode === "test" && testCompleted && currentSession) {
    return <TestResults 
      session={currentSession} 
      onRetakeTest={handleRetakeTest}
      onBackToStudy={handleBackToStudy}
    />;
  }

  const currentAnswer = testAnswers.get(currentCard.id);
  const timeSpent = mode === "test" ? Math.round((Date.now() - questionStartTime) / 1000) : undefined;

  return (
    <div>
      <FlashcardDisplay
        currentCard={currentCard}
        currentIndex={currentIndex}
        isFlipped={isFlipped}
        direction={direction}
        forceUpdate={forceUpdate}
        onFlip={handleFlip}
      />
      
      <StudyProgressDisplay
        currentIndex={currentIndex}
        totalCards={flashcards.length}
        streak={streak}
      />

      {/* Mode-specific controls */}
      {mode === "learn" && (
        <LearnModeControls
          progress={currentProgress}
          onMarkAsKnown={(isKnown) => markAsKnown(currentCard.id, isKnown)}
          onMarkAsDifficult={(isDifficult) => markAsDifficult(currentCard.id, isDifficult)}
          onConfidenceChange={handleConfidenceChange}
          isFirstTime={isFirstTime}
        />
      )}

      {mode === "test" && (
        <TestModeControls
          questionType="multiple_choice"
          frontContent={currentCard.front_content}
          backContent={currentCard.back_content}
          isAnswered={!!currentAnswer}
          userAnswer={currentAnswer?.answer}
          onAnswer={handleTestAnswer}
          timeSpent={timeSpent}
        />
      )}

      {/* Navigation - different for each mode */}
      {mode === "learn" && (
        <div className="flex justify-end mt-4">
          <StudyNavigation
            onPrevious={handlePrevious}
            onNext={handleLearnModeNext}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </div>
      )}

      {mode === "review" && (
        <>
          <div className="flex justify-end mt-4">
            <StudyNavigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              onFlip={() => setIsFlipped(!isFlipped)}
            />
          </div>
          
          {/* Score controls for review mode */}
          {isFlipped && (
            <StudyControls onScore={handleScoreCard} />
          )}
        </>
      )}

      {/* AI Explanation for premium users */}
      {isPremium && isFlipped && mode !== "test" && (
        <FlashcardExplanation 
          flashcard={currentCard}
          isVisible={isFlipped}
        />
      )}
    </div>
  );
};

export default FlashcardStudy;

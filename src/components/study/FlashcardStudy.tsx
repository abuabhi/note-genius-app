
import { StudyMode } from "@/pages/study/types";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FlashcardExplanation } from "./FlashcardExplanation";
import { isPremiumTier } from "@/utils/premiumFeatures";
import { useFlashcardStudy } from "./hooks/useFlashcardStudy";
import { useTestSessionManager } from "./hooks/useTestSessionManager";
import { useLearnModeManager } from "./hooks/useLearnModeManager";
import { FlashcardDisplay } from "./components/FlashcardDisplay";
import { StudyProgressDisplay } from "./components/StudyProgress";
import { StudyModeControls } from "./components/StudyModeControls";
import { StudyLoadingState, StudyErrorState, StudyEmptyState } from "./components/StudyStates";
import { TestResults } from "./modes/TestResults";

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

  const currentCard = flashcards[currentIndex];

  const {
    currentProgress,
    isFirstTime,
    handleLearnModeNext,
    handleConfidenceChange,
    markAsKnown,
    markAsDifficult
  } = useLearnModeManager({
    flashcards,
    mode,
    currentCard,
    handleNext
  });

  const {
    currentSession,
    testCompleted,
    currentAnswer,
    timeSpent,
    handleTestAnswer,
    handleRetakeTest,
    handleBackToStudy
  } = useTestSessionManager({
    flashcards,
    mode,
    setId,
    currentIndex,
    currentCard,
    handleNext
  });
  
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
  
  if (!currentCard) {
    console.error("FlashcardStudy - No current card at index:", currentIndex);
    return <StudyErrorState error="Invalid card index" />;
  }

  // Show test results if test is completed
  if (mode === "test" && testCompleted && currentSession) {
    return <TestResults 
      session={currentSession} 
      onRetakeTest={handleRetakeTest}
      onBackToStudy={handleBackToStudy}
    />;
  }

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

      <StudyModeControls
        mode={mode}
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        onPrevious={handlePrevious}
        onNext={mode === "learn" ? handleLearnModeNext : handleNext}
        onScoreCard={mode === "review" ? handleScoreCard : undefined}
        
        // Learn mode props
        currentProgress={currentProgress}
        onMarkAsKnown={(isKnown) => markAsKnown(currentCard.id, isKnown)}
        onMarkAsDifficult={(isDifficult) => markAsDifficult(currentCard.id, isDifficult)}
        onConfidenceChange={handleConfidenceChange}
        isFirstTime={isFirstTime}
        
        // Test mode props
        questionType="multiple_choice"
        frontContent={currentCard.front_content}
        backContent={currentCard.back_content}
        isAnswered={!!currentAnswer}
        userAnswer={currentAnswer?.answer}
        onAnswer={handleTestAnswer}
        timeSpent={timeSpent}
      />

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

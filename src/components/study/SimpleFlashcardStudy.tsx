
import { StudyMode } from "@/pages/study/types";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { isPremiumTier } from "@/utils/premiumFeatures";
import { useSimpleFlashcardStudy } from "@/hooks/useSimpleFlashcardStudy";
import { FlashcardDisplay } from "./components/FlashcardDisplay";
import { StudyProgressDisplay } from "./components/StudyProgress";
import { StudyModeControls } from "./components/StudyModeControls";
import { StudyLoadingState, StudyErrorState, StudyEmptyState } from "./components/StudyStates";

interface SimpleFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const SimpleFlashcardStudy = ({ setId, mode }: SimpleFlashcardStudyProps) => {
  const { userProfile } = useRequireAuth();
  const isPremium = isPremiumTier(userProfile?.user_tier);
  
  const {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    direction,
    error,
    forceUpdate,
    handleNext,
    handlePrevious,
    handleFlip,
    handleScoreCard,
    setIsFlipped
  } = useSimpleFlashcardStudy({ setId, mode });

  const currentCard = flashcards[currentIndex];
  
  console.log("SimpleFlashcardStudy - Rendering with:", {
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
    console.error("SimpleFlashcardStudy - No current card at index:", currentIndex);
    return <StudyErrorState error="Invalid card index" />;
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
        streak={0} // Simple implementation without streak calculation
      />

      <StudyModeControls
        mode={mode}
        isFlipped={isFlipped}
        setIsFlipped={setIsFlipped}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onScoreCard={mode === "review" ? handleScoreCard : undefined}
        
        // Simplified props for other modes
        questionType="flashcard"
        frontContent={currentCard.front_content}
        backContent={currentCard.back_content}
        isAnswered={false}
        onAnswer={() => {}}
      />
    </div>
  );
};

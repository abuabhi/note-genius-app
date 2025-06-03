
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
  
  // Add debugging for the main component
  console.log("FlashcardStudy - Rendering with:", {
    flashcardsCount: flashcards.length,
    currentIndex,
    currentCard: flashcards[currentIndex],
    isLoading,
    error
  });
  
  // Loading state
  if (isLoading) {
    return <StudyLoadingState />;
  }
  
  // Error state
  if (error) {
    return <StudyErrorState error={error} />;
  }
  
  // No flashcards state
  if (flashcards.length === 0) {
    return <StudyEmptyState />;
  }
  
  const currentCard = flashcards[currentIndex];
  
  if (!currentCard) {
    console.error("FlashcardStudy - No current card at index:", currentIndex);
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
        streak={streak}
      />
      
      <div className="flex justify-end">
        <StudyNavigation
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      </div>
      
      {/* Score controls for review mode */}
      {mode === "review" && isFlipped && (
        <StudyControls onScore={handleScoreCard} />
      )}
      
      {/* AI Explanation for difficult cards - shown only when card is flipped */}
      {isPremium && isFlipped && (
        <FlashcardExplanation 
          flashcard={currentCard}
          isVisible={isFlipped}
        />
      )}
    </div>
  );
};

export default FlashcardStudy;

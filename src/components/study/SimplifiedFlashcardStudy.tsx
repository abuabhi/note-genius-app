
import React, { useEffect } from 'react';
import { useOptimizedFlashcardStudy } from '@/hooks/useOptimizedFlashcardStudy';
import { StudyMode } from '@/pages/study/types';
import { FlashcardDisplayCard } from '@/components/flashcards/display/FlashcardDisplayCard';
import { StudyControls } from '@/components/flashcards/study/StudyControls';
import { StudyProgress } from '@/components/flashcards/study/StudyProgress';
import { StudyStats } from '@/components/flashcards/study/StudyStats';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const SimplifiedFlashcardStudy: React.FC<SimplifiedFlashcardStudyProps> = ({ 
  setId, 
  mode 
}) => {
  const {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    isComplete,
    currentCard,
    totalCards,
    studiedToday,
    masteredCount,
    handleNext,
    handlePrevious,
    handleFlip,
    handleCardChoice,
    setIsFlipped
  } = useOptimizedFlashcardStudy({ setId, mode });

  // Auto-flip prevention and session management
  useEffect(() => {
    if (isComplete) {
      console.log('Study session completed!');
    }
  }, [isComplete]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card className="p-8">
          <Skeleton className="h-64 w-full" />
        </Card>
        <div className="flex justify-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load flashcards: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No flashcards found in this set. Add some flashcards to start studying!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            🎉 Study Session Complete!
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Great job! You've studied all {totalCards} flashcards in this set.
          </p>
          <StudyStats
            totalCards={totalCards}
            studiedToday={studiedToday}
            masteredCount={masteredCount}
            showProgress={true}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Study Progress */}
      <StudyProgress
        currentIndex={currentIndex}
        totalCards={totalCards}
        studiedToday={studiedToday}
        masteredCount={masteredCount}
      />

      {/* Main Flashcard Display */}
      <div className="flex justify-center">
        <FlashcardDisplayCard
          flashcard={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          className="w-full max-w-2xl"
        />
      </div>

      {/* Study Controls */}
      <StudyControls
        onPrevious={handlePrevious}
        onNext={handleNext}
        onFlip={handleFlip}
        onChoice={handleCardChoice}
        isFlipped={isFlipped}
        currentIndex={currentIndex}
        totalCards={totalCards}
        canGoPrevious={currentIndex > 0}
        canGoNext={currentIndex < totalCards - 1}
        mode={mode}
      />

      {/* Study Stats */}
      <StudyStats
        totalCards={totalCards}
        studiedToday={studiedToday}
        masteredCount={masteredCount}
        showProgress={false}
      />
    </div>
  );
};

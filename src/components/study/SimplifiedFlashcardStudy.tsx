
import React, { useEffect } from 'react';
import { useOptimizedFlashcardStudy } from '@/hooks/useOptimizedFlashcardStudy';
import { StudyMode } from '@/pages/study/types';
import { FlashcardWithProgress } from '@/components/flashcards/display/FlashcardWithProgress';
import { StudyControls } from '@/components/flashcards/study/StudyControls';
import { CompactStudyProgress } from '@/components/study/CompactStudyProgress';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';

interface SimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const SimplifiedFlashcardStudy: React.FC<SimplifiedFlashcardStudyProps> = ({ 
  setId, 
  mode 
}) => {
  const { isActive, recordActivity } = useUnifiedSessionTracker();
  
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

  // Log session status when study starts
  useEffect(() => {
    if (flashcards.length > 0 && isActive) {
      console.log('📚 [SIMPLIFIED STUDY] Study session active with unified tracker');
    }
  }, [flashcards.length, isActive]);

  // Auto-flip prevention and session management
  useEffect(() => {
    if (isComplete) {
      console.log('🎉 Study session completed!');
      recordActivity(); // Record final activity
    }
  }, [isComplete, recordActivity]);

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
          {/* Single comprehensive stats display for completion */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalCards}</div>
              <div className="text-sm text-muted-foreground">Total Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{studiedToday}</div>
              <div className="text-sm text-muted-foreground">Studied Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{masteredCount}</div>
              <div className="text-sm text-muted-foreground">Mastered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Mastery</div>
            </div>
          </div>
          {isActive && (
            <div className="mt-4 p-3 bg-mint-50 border border-mint-200 rounded-lg">
              <p className="text-sm text-mint-700">
                📊 Session data has been recorded to your analytics
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      {/* Session Status Indicator */}
      {isActive && (
        <div className="p-3 bg-mint-50 border border-mint-200 rounded-lg">
          <div className="text-mint-800 text-sm">
            <strong>📊 Study Session Active</strong>
            <p className="text-xs text-mint-600 mt-1">
              Your progress is being tracked and will appear in analytics
            </p>
          </div>
        </div>
      )}

      {/* Compact Progress - Only at the top */}
      <CompactStudyProgress
        currentIndex={currentIndex}
        totalCards={totalCards}
        studiedToday={studiedToday}
        masteredCount={masteredCount}
      />

      {/* Main Flashcard Display with integrated progress donut */}
      <div className="flex justify-center">
        <FlashcardWithProgress
          flashcard={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          currentIndex={currentIndex}
          totalCards={totalCards}
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
    </div>
  );
};

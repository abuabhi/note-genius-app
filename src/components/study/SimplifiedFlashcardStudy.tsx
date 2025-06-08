
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOptimizedFlashcardStudy } from "@/hooks/useOptimizedFlashcardStudy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, X, Loader2 } from "lucide-react";
import { StudyMode } from "@/pages/study/types";
import { toast } from "sonner";

interface SimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
  currentSet?: any;
}

export const SimplifiedFlashcardStudy = ({ setId, mode, currentSet }: SimplifiedFlashcardStudyProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  
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
    setIsFlipped,
    invalidateCache
  } = useOptimizedFlashcardStudy({ setId, mode });

  // Enhanced handleCardChoice with loading state and cache invalidation
  const handleEnhancedCardChoice = useCallback(async (choice: 'mastered' | 'needs_practice') => {
    if (!currentCard || isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      await handleCardChoice(choice);
      // Invalidate cache to ensure progress updates are reflected
      invalidateCache();
    } catch (error) {
      console.error('Error saving card progress:', error);
      toast.error('Failed to save progress. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [currentCard, handleCardChoice, isUpdating, invalidateCache]);

  // Handle study again with proper cache invalidation
  const handleStudyAgain = useCallback(() => {
    console.log('🔄 Study Again clicked - reloading flashcards');
    invalidateCache();
    window.location.reload();
  }, [invalidateCache]);

  // Handle back to sets with proper React Router navigation
  const handleBackToSets = useCallback(() => {
    console.log('⬅️ Back to Sets clicked - navigating to /flashcards');
    navigate('/flashcards');
  }, [navigate]);

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-mint-500 mb-4" />
            <p className="text-mint-700">Loading flashcards...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-8">
          <div className="text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Study Session Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete || totalCards === 0) {
    return (
      <Card className="bg-gradient-to-br from-mint-50 to-blue-50 border-mint-200">
        <CardContent className="p-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-mint-800 mb-2">
              {totalCards === 0 ? 'No Cards Available' : 'Study Session Complete! 🎉'}
            </h2>
            <p className="text-mint-600 mb-6">
              {totalCards === 0 
                ? `No cards need ${mode === 'review' ? 'review' : 'learning'} at this time.`
                : `Great job! You've studied ${studiedToday} cards and mastered ${masteredCount} of them.`
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleStudyAgain}>
                {totalCards === 0 ? 'Refresh' : 'Study Again'}
              </Button>
              <Button variant="outline" onClick={handleBackToSets}>
                Back to Sets
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentCard) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-mint-700">No cards available for study.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-mint-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-mint-700">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <Badge variant="outline" className="bg-mint-100 text-mint-700 border-mint-200">
            {mode === 'learn' ? 'Learning' : 'Review'} Mode
          </Badge>
        </div>
        <div className="w-full bg-mint-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-mint-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main flashcard */}
      <Card className="bg-white/60 backdrop-blur-sm border-mint-100 min-h-[400px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-mint-800 flex items-center gap-2">
            <span>
              {isFlipped ? "Answer" : "Question"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Card content */}
          <div 
            className="min-h-[200px] flex items-center justify-center p-6 bg-gradient-to-br from-white to-mint-50 rounded-lg border border-mint-100 cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={handleFlip}
          >
            <div className="text-center">
              <p className="text-lg text-mint-800 leading-relaxed">
                {isFlipped 
                  ? (currentCard.back_content || currentCard.back) 
                  : (currentCard.front_content || currentCard.front)
                }
              </p>
              {!isFlipped && (
                <p className="text-sm text-mint-500 mt-4">
                  Click to reveal answer
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-4">
            {/* Flip button */}
            <Button
              onClick={handleFlip}
              variant="outline"
              className="w-full border-mint-200 hover:bg-mint-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isFlipped ? "Show Question" : "Show Answer"}
            </Button>

            {/* Choice buttons - only show when answer is revealed */}
            {isFlipped && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleEnhancedCardChoice('needs_practice')}
                  variant="outline"
                  className="border-orange-200 hover:bg-orange-50 text-orange-700"
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Need Practice
                </Button>
                <Button
                  onClick={() => handleEnhancedCardChoice('mastered')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Mastered'}
                </Button>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevious}
                variant="ghost"
                disabled={currentIndex === 0}
                className="text-mint-600 hover:bg-mint-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                variant="ghost"
                disabled={currentIndex === totalCards - 1}
                className="text-mint-600 hover:bg-mint-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-mint-800">{studiedToday}</p>
            <p className="text-sm text-mint-600">Cards Studied</p>
          </CardContent>
        </Card>
        <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{masteredCount}</p>
            <p className="text-sm text-mint-600">Cards Mastered</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


import { StudyMode } from "@/pages/study/types";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSimplifiedFlashcardStudy } from "@/hooks/useSimplifiedFlashcardStudy";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Trophy, Target } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
}

export const SimplifiedFlashcardStudy = ({ setId, mode }: SimplifiedFlashcardStudyProps) => {
  const { userProfile } = useRequireAuth();
  
  const {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    studiedToday,
    masteredCount,
    totalCards,
    isComplete,
    currentCard,
    handleCardChoice,
    handleNext,
    handlePrevious,
    handleFlip,
    setIsFlipped
  } = useSimplifiedFlashcardStudy({ setId, mode });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No flashcards available for this mode.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Great Job!</h2>
        <p className="text-muted-foreground mb-6">
          You've completed this study session
        </p>
        <div className="flex justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{studiedToday}</div>
            <div className="text-sm text-muted-foreground">Cards Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{masteredCount}</div>
            <div className="text-sm text-muted-foreground">Mastered</div>
          </div>
        </div>
        <Button onClick={() => window.history.back()}>Back to Sets</Button>
      </div>
    );
  }
  
  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Invalid card data</p>
      </div>
    );
  }

  const progressPercent = ((currentIndex + 1) / totalCards) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {totalCards}
            </span>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{studiedToday} today</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{masteredCount} mastered</span>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard.id}-${isFlipped}`}
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer"
            onClick={handleFlip}
          >
            <Card className="min-h-[400px] shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="text-lg md:text-xl font-medium">
                    {isFlipped ? currentCard.back_content : currentCard.front_content}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isFlipped ? "Back" : "Front"} • Click to flip
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={handleFlip}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Flip Card
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex >= totalCards - 1}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Study Choices */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4"
          >
            <Button
              onClick={() => handleCardChoice('needs_practice')}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <XCircle className="h-5 w-5" />
              Need Practice
            </Button>
            
            <Button
              onClick={() => handleCardChoice('mastered')}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200 hover:border-green-300"
            >
              <CheckCircle className="h-5 w-5" />
              Know This
            </Button>
          </motion.div>
        )}

        {/* Mode-specific hints */}
        {!isFlipped && (
          <div className="text-center text-sm text-muted-foreground">
            {mode === "learn" && "Study each card carefully, then flip to see the answer"}
            {mode === "review" && "Review cards you need to practice"}
            {mode === "test" && "Test your knowledge on these flashcards"}
          </div>
        )}
      </div>
    </div>
  );
};

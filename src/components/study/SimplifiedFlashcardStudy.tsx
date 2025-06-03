
import { StudyMode } from "@/pages/study/types";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSimplifiedFlashcardStudy } from "@/hooks/useSimplifiedFlashcardStudy";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Trophy, Target, Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
  currentSet?: any;
}

const CircularProgress = ({ value, size = 100, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-mint-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-mint-500 transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-mint-700">{Math.round(value)}%</span>
      </div>
    </div>
  );
};

export const SimplifiedFlashcardStudy = ({ setId, mode, currentSet }: SimplifiedFlashcardStudyProps) => {
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
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-mint-700 font-medium">Loading flashcards...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-100 rounded-lg p-6 max-w-md mx-auto">
          <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-mint-50 border border-mint-100 rounded-lg p-8 max-w-md mx-auto">
          <Target className="h-12 w-12 text-mint-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-mint-800 mb-2">No flashcards available</h3>
          <p className="text-muted-foreground mb-6">This study mode doesn't have any flashcards yet.</p>
          <Button onClick={() => window.history.back()} variant="outline" className="border-mint-200 text-mint-700 hover:bg-mint-50">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-mint-50 border border-mint-100 rounded-xl p-8 max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Trophy className="h-16 w-16 text-mint-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-4 text-mint-800">
            Excellent Work!
          </h2>
          <p className="text-muted-foreground mb-8">
            You've completed this study session successfully
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center p-4 bg-white rounded-lg border border-mint-100">
              <div className="text-2xl font-bold text-mint-600">{studiedToday}</div>
              <div className="text-sm text-muted-foreground">Cards Today</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-mint-100">
              <div className="text-2xl font-bold text-mint-600">{masteredCount}</div>
              <div className="text-sm text-muted-foreground">Mastered</div>
            </div>
          </div>
          <Button 
            onClick={() => window.history.back()}
            size="lg"
            className="bg-mint-500 hover:bg-mint-600 text-white"
          >
            Back to Sets
          </Button>
        </motion.div>
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <CircularProgress value={progressPercent} />
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-mint-800">
                Card {currentIndex + 1} of {totalCards}
              </h2>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 px-2 py-1 bg-mint-50 rounded-full">
                  <Target className="h-3 w-3 text-mint-500" />
                  <span className="font-medium text-mint-700">{studiedToday} studied today</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-mint-50 rounded-full">
                  <CheckCircle className="h-3 w-3 text-mint-500" />
                  <span className="font-medium text-mint-700">{masteredCount} mastered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2 bg-mint-100" indicatorClassName="bg-mint-500" />
      </div>

      {/* Flashcard */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard.id}-${isFlipped}`}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="cursor-pointer"
            onClick={handleFlip}
          >
            <Card className="min-h-[400px] shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white border-mint-100">
              <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                <div className="text-center space-y-6 max-w-xl">
                  <div className="text-lg md:text-xl leading-relaxed text-mint-800">
                    {isFlipped ? currentCard.back_content : currentCard.front_content}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${isFlipped ? 'bg-mint-400' : 'bg-mint-300'}`}></div>
                    <span className="text-sm font-medium">
                      {isFlipped ? "Back" : "Front"} • Click to flip
                    </span>
                    <RotateCcw className="h-4 w-4 opacity-60" />
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
            className="flex items-center gap-2 border-mint-200 text-mint-700 hover:bg-mint-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            onClick={handleFlip}
            className="flex items-center gap-2 bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100"
          >
            <RotateCcw className="h-4 w-4" />
            Flip Card
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex >= totalCards - 1}
            className="flex items-center gap-2 border-mint-200 text-mint-700 hover:bg-mint-50 disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Study Choices */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Button
              onClick={() => handleCardChoice('needs_practice')}
              size="lg"
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
              variant="outline"
            >
              <XCircle className="h-5 w-5" />
              Need Practice
            </Button>
            
            <Button
              onClick={() => handleCardChoice('mastered')}
              size="lg"
              className="flex items-center gap-2 bg-mint-50 border border-mint-200 text-mint-700 hover:bg-mint-100 hover:text-mint-800"
              variant="outline"
            >
              <CheckCircle className="h-5 w-5" />
              Know This
            </Button>
          </motion.div>
        )}

        {/* Mode hint */}
        {!isFlipped && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-mint-50 rounded-full text-mint-700 border border-mint-100">
              <Clock className="h-3 w-3" />
              <span className="text-sm">
                {mode === "learn" && "Study each card carefully, then flip to see the answer"}
                {mode === "review" && "Review cards you need to practice"}
                {mode === "test" && "Test your knowledge on these flashcards"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


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

const CircularProgress = ({ value, size = 120, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) => {
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
          className="text-muted/20"
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
          className="text-blue-500 transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-blue-600">{Math.round(value)}%</span>
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
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium">Loading flashcards...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No flashcards available</h3>
          <p className="text-muted-foreground mb-6">This study mode doesn't have any flashcards yet.</p>
          <Button onClick={() => window.history.back()} variant="outline">
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
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-8 max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Excellent Work!
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            You've completed this study session successfully
          </p>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{studiedToday}</div>
              <div className="text-sm text-muted-foreground">Cards Today</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600">{masteredCount}</div>
              <div className="text-sm text-muted-foreground">Mastered</div>
            </div>
          </div>
          <Button 
            onClick={() => window.history.back()}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Enhanced Progress Header */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-6">
            <CircularProgress value={progressPercent} />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                Card {currentIndex + 1} of {totalCards}
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-700">{studiedToday} studied today</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-700">{masteredCount} mastered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Progress value={progressPercent} className="h-3 bg-gray-100" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500" />
      </div>

      {/* Enhanced Flashcard */}
      <div className="relative min-h-[500px] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard.id}-${isFlipped}`}
            initial={{ rotateY: 180, opacity: 0, scale: 0.8 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            exit={{ rotateY: -180, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="cursor-pointer group"
            onClick={handleFlip}
          >
            <Card className="min-h-[500px] shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-2 hover:border-blue-200 group-hover:scale-[1.02]">
              <CardContent className="p-12 flex flex-col items-center justify-center h-full relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>
                
                <div className="text-center space-y-8 relative z-10 max-w-2xl">
                  <div className="text-2xl md:text-3xl font-medium leading-relaxed">
                    {isFlipped ? currentCard.back_content : currentCard.front_content}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className={`w-3 h-3 rounded-full ${isFlipped ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                    <span className="text-lg font-medium">
                      {isFlipped ? "Back" : "Front"} • Click to flip
                    </span>
                    <RotateCcw className="h-5 w-5 opacity-60" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Controls */}
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            size="lg"
            className="flex items-center gap-3 px-6 py-3 disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Previous</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleFlip}
            size="lg"
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="font-medium">Flip Card</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex >= totalCards - 1}
            size="lg"
            className="flex items-center gap-3 px-6 py-3 disabled:opacity-50 hover:bg-gray-50"
          >
            <span className="font-medium">Next</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Enhanced Study Choices */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center gap-6"
          >
            <Button
              onClick={() => handleCardChoice('needs_practice')}
              size="lg"
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <XCircle className="h-6 w-6" />
              <span className="font-semibold text-lg">Need Practice</span>
            </Button>
            
            <Button
              onClick={() => handleCardChoice('mastered')}
              size="lg"
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold text-lg">Know This</span>
            </Button>
          </motion.div>
        )}

        {/* Mode-specific hints */}
        {!isFlipped && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
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

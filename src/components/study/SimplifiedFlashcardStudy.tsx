
import { StudyMode } from "@/pages/study/types";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSimplifiedFlashcardStudy } from "@/hooks/useSimplifiedFlashcardStudy";
import { useQuizMode } from "@/hooks/useQuizMode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Trophy, Target, Clock } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { QuizResults } from "./QuizResults";
import { QuizTimer } from "./QuizTimer";

interface SimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
  currentSet?: any;
}

const DonutProgress = ({ current, total }: { current: number; total: number }) => {
  const percentage = (current / total) * 100;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-mint-100"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-mint-500 transition-all duration-300 ease-in-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-mint-700">
          {current}/{total}
        </span>
      </div>
    </div>
  );
};

export const SimplifiedFlashcardStudy = ({ setId, mode, currentSet }: SimplifiedFlashcardStudyProps) => {
  const { userProfile } = useRequireAuth();
  
  // Use different hooks based on mode
  const studyHook = useSimplifiedFlashcardStudy({ setId, mode });
  const quizHook = useQuizMode({ setId, mode });
  
  // Select which hook to use based on mode
  const isQuizMode = mode === "test";
  const {
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    isComplete,
    currentCard,
    handleNext,
    handlePrevious,
    handleFlip,
    setIsFlipped,
    totalCards
  } = isQuizMode ? quizHook : studyHook;

  // Quiz-specific properties (only available in quiz mode)
  const quizData = isQuizMode ? {
    timeLeft: quizHook.timeLeft,
    totalScore: quizHook.totalScore,
    correctAnswers: quizHook.correctAnswers,
    isTimerActive: quizHook.isTimerActive,
    quizSession: quizHook.quizSession,
    handleQuizAnswer: quizHook.handleQuizAnswer
  } : null;

  // Study-specific properties (only available in study modes)
  const studyData = !isQuizMode ? {
    studiedToday: studyHook.studiedToday,
    masteredCount: studyHook.masteredCount,
    handleCardChoice: studyHook.handleCardChoice
  } : null;

  const handleRestart = () => {
    window.location.reload();
  };

  const handleBackToSets = () => {
    window.history.back();
  };

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
    if (isQuizMode && quizData?.quizSession) {
      return (
        <QuizResults
          totalCards={totalCards}
          correctAnswers={quizData.correctAnswers}
          totalScore={quizData.totalScore}
          durationSeconds={quizData.quizSession.duration_seconds || undefined}
          averageResponseTime={quizData.quizSession.average_response_time || undefined}
          grade={quizData.quizSession.grade || undefined}
          onRestart={handleRestart}
          onBackToSets={handleBackToSets}
        />
      );
    }

    // Regular completion screen for study/review modes
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
          {studyData && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 bg-white rounded-lg border border-mint-100">
                <div className="text-2xl font-bold text-mint-600">{studyData.studiedToday}</div>
                <div className="text-sm text-muted-foreground">Cards Today</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-mint-100">
                <div className="text-2xl font-bold text-mint-600">{studyData.masteredCount}</div>
                <div className="text-sm text-muted-foreground">Mastered</div>
              </div>
            </div>
          )}
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header with Timer and Score */}
      {isQuizMode && quizData && (
        <div className="flex items-center justify-between">
          <QuizTimer 
            timeLeft={quizData.timeLeft} 
            isActive={quizData.isTimerActive} 
          />
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-mint-50 px-3 py-1 rounded-full border border-mint-200">
              <span className="text-mint-700 font-medium">Score: {quizData.totalScore}</span>
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <span className="text-green-700 font-medium">Correct: {quizData.correctAnswers}</span>
            </div>
          </div>
        </div>
      )}

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
            <Card className="min-h-[400px] shadow-md hover:shadow-lg transition-shadow duration-200 bg-white border-mint-100 relative">
              {/* Donut progress in top right corner */}
              <div className="absolute top-4 right-4 z-10">
                <DonutProgress current={currentIndex + 1} total={totalCards} />
              </div>
              
              <CardContent className="p-8 h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center max-w-2xl w-full">
                  <div className="text-lg md:text-xl leading-relaxed text-mint-800 mb-6">
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
        {/* Navigation - disabled in quiz mode */}
        {!isQuizMode && (
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
        )}

        {/* Study/Quiz Choices */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Button
              onClick={() => {
                if (isQuizMode && quizData) {
                  quizData.handleQuizAnswer('needs_practice');
                } else if (studyData) {
                  studyData.handleCardChoice('needs_practice');
                }
              }}
              size="lg"
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
              variant="outline"
            >
              <XCircle className="h-5 w-5" />
              {isQuizMode ? "Incorrect" : "Need Practice"}
            </Button>
            
            <Button
              onClick={() => {
                if (isQuizMode && quizData) {
                  quizData.handleQuizAnswer('mastered');
                } else if (studyData) {
                  studyData.handleCardChoice('mastered');
                }
              }}
              size="lg"
              className="flex items-center gap-2 bg-mint-50 border border-mint-200 text-mint-700 hover:bg-mint-100 hover:text-mint-800"
              variant="outline"
            >
              <CheckCircle className="h-5 w-5" />
              {isQuizMode ? "Correct" : "Know This"}
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
                {mode === "test" && isQuizMode && quizData && `Quiz Mode - ${quizData.timeLeft}s remaining per card`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

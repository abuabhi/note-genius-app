
import { StudyMode } from "@/pages/study/types";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useSimplifiedFlashcardStudy } from "@/hooks/useSimplifiedFlashcardStudy";
import { useQuizMode } from "@/hooks/useQuizMode";
import { XCircle, Trophy, Target } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuizResults } from "./QuizResults";
import { FlashcardContent } from "./components/FlashcardContent";
import { NavigationControls } from "./components/NavigationControls";
import { StudyChoices } from "./components/StudyChoices";
import { ModeHint } from "./components/ModeHint";
import { QuizHeader } from "./components/QuizHeader";
import { StudySessionTracker } from "./StudySessionTracker";

interface SimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
  currentSet?: any;
}

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

  const handleCorrectAnswer = () => {
    if (isQuizMode && quizData) {
      quizData.handleQuizAnswer('mastered');
    } else if (studyData) {
      studyData.handleCardChoice('mastered');
    }
  };

  const handleIncorrectAnswer = () => {
    if (isQuizMode && quizData) {
      quizData.handleQuizAnswer('needs_practice');
    } else if (studyData) {
      studyData.handleCardChoice('needs_practice');
    }
  };

  // Calculate total cards studied for session tracking
  const cardsStudied = studyData ? studyData.studiedToday : (quizData ? quizData.correctAnswers : 0);

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
      {/* Study Session Tracker - only show during active study */}
      {setId && currentSet && !isComplete && (
        <StudySessionTracker
          flashcardSetId={setId}
          flashcardSetName={currentSet?.name || "Flashcard Study"}
          cardsStudied={cardsStudied}
          onSessionStart={() => {
            console.log("Study session started for:", currentSet?.name);
          }}
          onSessionEnd={() => {
            console.log("Study session ended");
          }}
        />
      )}

      {/* Quiz Header with Timer and Score */}
      {isQuizMode && quizData && (
        <QuizHeader
          timeLeft={quizData.timeLeft}
          isTimerActive={quizData.isTimerActive}
          totalScore={quizData.totalScore}
          correctAnswers={quizData.correctAnswers}
        />
      )}

      {/* Flashcard */}
      <FlashcardContent
        currentCard={currentCard}
        isFlipped={isFlipped}
        currentIndex={currentIndex}
        totalCards={totalCards}
        onFlip={handleFlip}
      />

      {/* Controls */}
      <div className="space-y-4">
        {/* Navigation - disabled in quiz mode */}
        <NavigationControls
          currentIndex={currentIndex}
          totalCards={totalCards}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFlip={handleFlip}
          isQuizMode={isQuizMode}
        />

        {/* Study/Quiz Choices */}
        <StudyChoices
          isFlipped={isFlipped}
          isQuizMode={isQuizMode}
          onCorrect={handleCorrectAnswer}
          onIncorrect={handleIncorrectAnswer}
        />

        {/* Mode hint */}
        <ModeHint
          mode={mode}
          isFlipped={isFlipped}
          timeLeft={quizData?.timeLeft}
        />
      </div>
    </div>
  );
};

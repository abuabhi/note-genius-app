
import { StudyMode } from "@/pages/study/types";
import { useSimplifiedFlashcardStudy } from "@/hooks/useSimplifiedFlashcardStudy";
import { useQuizMode } from "@/hooks/useQuizMode";

interface StudySessionManagerProps {
  setId: string;
  mode: StudyMode;
  children: (sessionData: any) => React.ReactNode;
}

export const StudySessionManager = ({ setId, mode, children }: StudySessionManagerProps) => {
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

  const sessionData = {
    // Core state
    flashcards,
    currentIndex,
    isFlipped,
    isLoading,
    error,
    isComplete,
    currentCard,
    totalCards,
    isQuizMode,
    cardsStudied,
    mode,
    
    // Handlers
    handleNext,
    handlePrevious,
    handleFlip,
    handleCorrectAnswer,
    handleIncorrectAnswer,
    setIsFlipped,
    
    // Mode-specific data
    quizData,
    studyData
  };

  return <>{children(sessionData)}</>;
};

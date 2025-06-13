
import { StudyMode } from "@/pages/study/types";
import { useOptimizedFlashcardStudy } from "@/hooks/useOptimizedFlashcardStudy";
import { useQuizMode } from "@/hooks/useQuizMode";
import { useBasicSessionTracker } from "@/hooks/useBasicSessionTracker";

interface StudySessionManagerProps {
  setId: string;
  mode: StudyMode;
  children: (sessionData: any) => React.ReactNode;
  // Session methods are now managed by the unified system
  recordActivity?: () => void;
  updateSessionActivity?: (data: any) => void;
}

export const StudySessionManager = ({ 
  setId, 
  mode, 
  children,
  recordActivity: externalRecord = () => {},
  updateSessionActivity: externalUpdate = () => {}
}: StudySessionManagerProps) => {
  
  // Use the unified session tracker
  const { recordActivity, updateSessionActivity } = useBasicSessionTracker();
  
  console.log('🎛️ [STUDY SESSION MANAGER] Using unified session system:', {
    setId,
    mode,
    hasUnifiedSession: !!recordActivity
  });
  
  // Use different hooks based on mode, passing unified session methods
  const studyHook = useOptimizedFlashcardStudy({ 
    setId, 
    mode, 
    recordActivity, 
    updateSessionActivity 
  });
  const quizHook = useQuizMode({ 
    setId, 
    mode, 
    recordActivity, 
    updateSessionActivity 
  });
  
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
    console.log('✅ [STUDY SESSION MANAGER] Correct answer - updating unified session');
    recordActivity();
    if (isQuizMode && quizData) {
      quizData.handleQuizAnswer('mastered');
    } else if (studyData) {
      studyData.handleCardChoice('mastered');
    }
  };

  const handleIncorrectAnswer = () => {
    console.log('❌ [STUDY SESSION MANAGER] Incorrect answer - updating unified session');
    recordActivity();
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
    
    // Handlers (with unified session activity recording)
    handleNext: () => {
      recordActivity();
      handleNext();
    },
    handlePrevious: () => {
      recordActivity();
      handlePrevious();
    },
    handleFlip: () => {
      recordActivity();
      handleFlip();
    },
    handleCorrectAnswer,
    handleIncorrectAnswer,
    setIsFlipped,
    
    // Mode-specific data
    quizData,
    studyData
  };

  return <>{children(sessionData)}</>;
};

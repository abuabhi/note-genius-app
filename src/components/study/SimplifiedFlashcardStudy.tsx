
import { StudyMode } from "@/pages/study/types";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { QuizResults } from "./QuizResults";
import { FlashcardContent } from "./components/FlashcardContent";
import { NavigationControls } from "./components/NavigationControls";
import { StudyChoices } from "./components/StudyChoices";
import { ModeHint } from "./components/ModeHint";
import { QuizHeader } from "./components/QuizHeader";
import { StudySessionTracker } from "./StudySessionTracker";
import { StudySessionManager } from "./components/StudySessionManager";
import { StudyLoadingState, StudyErrorState, StudyEmptyState, StudyCompletionState } from "./components/StudyStates";
import { useState } from "react";

interface SimplifiedFlashcardStudyProps {
  setId: string;
  mode: StudyMode;
  currentSet?: any;
}

export const SimplifiedFlashcardStudy = ({ setId, mode, currentSet }: SimplifiedFlashcardStudyProps) => {
  const { userProfile } = useRequireAuth();
  const [hasUserStartedStudying, setHasUserStartedStudying] = useState(false);

  const handleRestart = () => {
    window.location.reload();
  };

  const handleBackToSets = () => {
    window.history.back();
  };

  const handleFirstStudyAction = () => {
    if (!hasUserStartedStudying) {
      setHasUserStartedStudying(true);
    }
  };

  return (
    <StudySessionManager setId={setId} mode={mode}>
      {(sessionData) => {
        const {
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
          handleNext,
          handlePrevious,
          handleFlip,
          handleCorrectAnswer,
          handleIncorrectAnswer,
          quizData,
          studyData
        } = sessionData;

        if (isLoading) {
          return <StudyLoadingState />;
        }
        
        if (error) {
          return <StudyErrorState error={error} />;
        }
        
        if (flashcards.length === 0) {
          return <StudyEmptyState />;
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

          return (
            <StudyCompletionState
              isQuizMode={isQuizMode}
              studiedToday={studyData?.studiedToday}
              masteredCount={studyData?.masteredCount}
            />
          );
        }
        
        if (!currentCard) {
          return (
            <div className="text-center py-12">
              <p className="text-red-600">Invalid card data</p>
            </div>
          );
        }

        // Enhanced handlers that trigger session start
        const enhancedHandleFlip = () => {
          handleFirstStudyAction();
          handleFlip();
        };

        const enhancedHandleCorrect = () => {
          handleFirstStudyAction();
          handleCorrectAnswer();
        };

        const enhancedHandleIncorrect = () => {
          handleFirstStudyAction();
          handleIncorrectAnswer();
        };

        const enhancedHandleNext = () => {
          handleFirstStudyAction();
          handleNext();
        };

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
                triggerStudyActivity={hasUserStartedStudying}
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
              onFlip={enhancedHandleFlip}
            />

            {/* Controls */}
            <div className="space-y-4">
              {/* Navigation - disabled in quiz mode */}
              <NavigationControls
                currentIndex={currentIndex}
                totalCards={totalCards}
                onPrevious={handlePrevious}
                onNext={enhancedHandleNext}
                onFlip={enhancedHandleFlip}
                isQuizMode={isQuizMode}
              />

              {/* Study/Quiz Choices */}
              <StudyChoices
                isFlipped={isFlipped}
                isQuizMode={isQuizMode}
                onCorrect={enhancedHandleCorrect}
                onIncorrect={enhancedHandleIncorrect}
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
      }}
    </StudySessionManager>
  );
};

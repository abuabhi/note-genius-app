
import { StudyMode } from "@/pages/study/types";
import { StudyNavigation } from "./StudyNavigation";
import { StudyControls } from "../StudyControls";
import { LearnModeControls } from "../modes/LearnModeControls";
import { TestModeControls } from "../modes/TestModeControls";

interface StudyModeControlsProps {
  mode: StudyMode;
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
  onScoreCard?: (score: number) => void;
  
  // Learn mode props
  currentProgress?: any;
  onMarkAsKnown?: (isKnown: boolean) => void;
  onMarkAsDifficult?: (isDifficult: boolean) => void;
  onConfidenceChange?: (level: number) => void;
  isFirstTime?: boolean;
  
  // Test mode props
  questionType?: "flashcard" | "multiple_choice" | "fill_blank";
  frontContent?: string;
  backContent?: string;
  isAnswered?: boolean;
  userAnswer?: string;
  onAnswer?: (answer: string, isCorrect: boolean) => void;
  timeSpent?: number;
}

export const StudyModeControls = ({
  mode,
  isFlipped,
  setIsFlipped,
  onPrevious,
  onNext,
  onScoreCard,
  currentProgress,
  onMarkAsKnown,
  onMarkAsDifficult,
  onConfidenceChange,
  isFirstTime,
  questionType,
  frontContent,
  backContent,
  isAnswered,
  userAnswer,
  onAnswer,
  timeSpent
}: StudyModeControlsProps) => {
  if (mode === "learn") {
    return (
      <>
        <LearnModeControls
          progress={currentProgress}
          onMarkAsKnown={onMarkAsKnown || (() => {})}
          onMarkAsDifficult={onMarkAsDifficult || (() => {})}
          onConfidenceChange={onConfidenceChange || (() => {})}
          isFirstTime={isFirstTime || false}
        />
        <div className="flex justify-end mt-4">
          <StudyNavigation
            onPrevious={onPrevious}
            onNext={onNext}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </div>
      </>
    );
  }

  if (mode === "test") {
    return (
      <TestModeControls
        questionType={questionType || "flashcard"}
        frontContent={frontContent || ""}
        backContent={backContent || ""}
        isAnswered={isAnswered || false}
        userAnswer={userAnswer}
        onAnswer={onAnswer || (() => {})}
        timeSpent={timeSpent}
      />
    );
  }

  if (mode === "review") {
    return (
      <>
        <div className="flex justify-end mt-4">
          <StudyNavigation
            onPrevious={onPrevious}
            onNext={onNext}
            onFlip={() => setIsFlipped(!isFlipped)}
          />
        </div>
        
        {/* Score controls for review mode */}
        {isFlipped && onScoreCard && (
          <StudyControls onScore={onScoreCard} />
        )}
      </>
    );
  }

  return null;
};

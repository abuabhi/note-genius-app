
import { QuizTimer } from "../QuizTimer";

interface QuizHeaderProps {
  timeLeft: number;
  isTimerActive: boolean;
  totalScore: number;
  correctAnswers: number;
}

export const QuizHeader = ({
  timeLeft,
  isTimerActive,
  totalScore,
  correctAnswers
}: QuizHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <QuizTimer 
        timeLeft={timeLeft} 
        isActive={isTimerActive} 
      />
      <div className="flex items-center gap-4 text-sm">
        <div className="bg-mint-50 px-3 py-1 rounded-full border border-mint-200">
          <span className="text-mint-700 font-medium">Score: {totalScore}</span>
        </div>
        <div className="bg-green-50 px-3 py-1 rounded-full border border-green-200">
          <span className="text-green-700 font-medium">Correct: {correctAnswers}</span>
        </div>
      </div>
    </div>
  );
};

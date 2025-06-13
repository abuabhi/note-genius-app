
import { useBasicSessionTracker } from '@/hooks/useBasicSessionTracker';

interface QuizStudyTrackerProps {
  quizId: string;
  quizName: string;
  subject?: string;
  score?: number;
  totalQuestions?: number;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  triggerStudyActivity?: boolean;
  showDonutCounter?: boolean;
  donutSize?: 'small' | 'medium' | 'large';
}

export const QuizStudyTracker = ({
  quizId,
  quizName,
  subject,
  score = 0,
  totalQuestions = 0,
  onSessionStart,
  onSessionEnd,
  triggerStudyActivity = false,
  showDonutCounter = true,
  donutSize = 'medium'
}: QuizStudyTrackerProps) => {
  
  const { recordActivity, updateSessionActivity, isActive } = useBasicSessionTracker();
  
  console.log('🎯 [QUIZ TRACKER] Using unified session via SessionDock:', {
    quizId,
    quizName,
    score,
    totalQuestions,
    isActive,
    triggerStudyActivity
  });
  
  // Record quiz study activity when triggered
  if (triggerStudyActivity && isActive) {
    recordActivity();
    updateSessionActivity({
      quiz_score: score,
      quiz_total_questions: totalQuestions
    });
  }
  
  return (
    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="text-green-800 text-sm">
        <strong>Quiz Study Tracker</strong>
        <p className="mt-1">
          Quiz: {quizName}
        </p>
        {totalQuestions > 0 && (
          <p className="text-xs text-green-600 mt-1">
            Score: {score}/{totalQuestions}
          </p>
        )}
        <p className="text-xs text-green-600 mt-1">
          Session managed by SessionDock • Status: {isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
  );
};


import { StudySessionWithDonutTracker } from '@/components/study/StudySessionWithDonutTracker';

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
  return (
    <StudySessionWithDonutTracker
      activityType="quiz"
      resourceId={quizId}
      resourceName={quizName}
      subject={subject}
      quizScore={score}
      totalQuestions={totalQuestions}
      onSessionStart={onSessionStart}
      onSessionEnd={onSessionEnd}
      triggerStudyActivity={triggerStudyActivity}
      showDonutCounter={showDonutCounter}
      donutSize={donutSize}
      donutPosition="side"
    />
  );
};

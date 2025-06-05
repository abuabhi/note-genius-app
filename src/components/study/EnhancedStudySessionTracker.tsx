
import { useEffect, useState } from 'react';
import { useAutoSessionManager } from '@/hooks/useAutoSessionManager';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Target, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedStudySessionTrackerProps {
  activityType: 'flashcard' | 'quiz' | 'note';
  resourceId?: string;
  resourceName?: string;
  subject?: string;
  cardsStudied?: number;
  correctAnswers?: number;
  quizScore?: number;
  totalQuestions?: number;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
}

export const EnhancedStudySessionTracker = ({
  activityType,
  resourceId,
  resourceName,
  subject,
  cardsStudied = 0,
  correctAnswers = 0,
  quizScore = 0,
  totalQuestions = 0,
  onSessionStart,
  onSessionEnd
}: EnhancedStudySessionTrackerProps) => {
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const {
    currentSession,
    isSessionActive,
    updateSessionWithPerformance,
    recordActivity
  } = useAutoSessionManager({
    activityType,
    resourceId,
    resourceName,
    subject
  });

  // Set session start time when session becomes active
  useEffect(() => {
    if (isSessionActive && currentSession && !sessionStartTime) {
      setSessionStartTime(new Date(currentSession.start_time));
      onSessionStart?.();
    } else if (!isSessionActive && sessionStartTime) {
      setSessionStartTime(null);
      onSessionEnd?.();
    }
  }, [isSessionActive, currentSession, sessionStartTime, onSessionStart, onSessionEnd]);

  // Update session performance when metrics change
  useEffect(() => {
    if (isSessionActive && currentSession) {
      updateSessionWithPerformance({
        cards_reviewed: cardsStudied,
        cards_correct: correctAnswers,
        quiz_score: quizScore,
        quiz_total_questions: totalQuestions
      });

      // Record activity to reset inactivity timer
      recordActivity({
        cards_studied: cardsStudied,
        correct_answers: correctAnswers,
        quiz_score: quizScore,
        timestamp: new Date().toISOString()
      });
    }
  }, [cardsStudied, correctAnswers, quizScore, totalQuestions, isSessionActive, currentSession]);

  if (!currentSession || !isSessionActive) {
    return null;
  }

  const sessionDuration = sessionStartTime ? 
    formatDistanceToNow(sessionStartTime, { includeSeconds: true }) : '0 seconds';

  const accuracy = cardsStudied > 0 ? Math.round((correctAnswers / cardsStudied) * 100) : 0;
  const quizAccuracy = totalQuestions > 0 ? Math.round((quizScore / totalQuestions) * 100) : 0;

  const getActivityIcon = () => {
    switch (activityType) {
      case 'flashcard':
        return BookOpen;
      case 'quiz':
        return Target;
      case 'note':
        return BookOpen;
      default:
        return BookOpen;
    }
  };

  const ActivityIcon = getActivityIcon();

  return (
    <Card className="border-mint-200 bg-gradient-to-r from-mint-50 to-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-mint-800">
              Active {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Session
            </span>
          </div>
          
          <Badge variant="outline" className="bg-white/80">
            <Clock className="h-3 w-3 mr-1" />
            {sessionDuration}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-mint-600" />
            <div>
              <div className="text-lg font-semibold text-mint-800">
                {activityType === 'flashcard' ? cardsStudied : totalQuestions}
              </div>
              <div className="text-xs text-mint-600">
                {activityType === 'flashcard' ? 'Cards' : 'Questions'}
              </div>
            </div>
          </div>

          {(cardsStudied > 0 || totalQuestions > 0) && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-lg font-semibold text-green-800">
                  {activityType === 'flashcard' ? accuracy : quizAccuracy}%
                </div>
                <div className="text-xs text-green-600">Accuracy</div>
              </div>
            </div>
          )}

          {subject && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-800 truncate">
                  {subject}
                </div>
                <div className="text-xs text-blue-600">Subject</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            <div>
              <div className="text-lg font-semibold text-purple-800">
                {correctAnswers}
              </div>
              <div className="text-xs text-purple-600">Correct</div>
            </div>
          </div>
        </div>

        {resourceName && (
          <div className="mt-3 pt-3 border-t border-mint-200">
            <div className="text-sm text-mint-700">
              <span className="font-medium">Studying:</span> {resourceName}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

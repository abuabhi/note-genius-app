
import { useEffect, useState } from 'react';
import { useAutoSessionManager } from '@/hooks/useAutoSessionManager';
import { useAdaptiveLearningIntegration } from '@/hooks/useAdaptiveLearningIntegration';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Target, TrendingUp, Brain } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AdaptiveStudyTracker } from './AdaptiveStudyTracker';

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
  triggerStudyActivity?: boolean; // New prop to trigger session start
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
  onSessionEnd,
  triggerStudyActivity = false
}: EnhancedStudySessionTrackerProps) => {
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [adaptationsApplied, setAdaptationsApplied] = useState<any[]>([]);
  
  const {
    currentSession,
    isSessionActive,
    hasStartedStudying,
    updateSessionWithPerformance,
    recordStudyActivity
  } = useAutoSessionManager({
    activityType,
    resourceId,
    resourceName,
    subject
  });

  const {
    createLearningPathFromActivity,
    updateLearningPathProgress
  } = useAdaptiveLearningIntegration();

  // Trigger session start when study activity begins
  useEffect(() => {
    if (triggerStudyActivity && !hasStartedStudying) {
      recordStudyActivity({
        initial_activity: true,
        activity_type: activityType,
        resource_id: resourceId
      });
    }
  }, [triggerStudyActivity, hasStartedStudying, recordStudyActivity, activityType, resourceId]);

  // Set session start time when session becomes active
  useEffect(() => {
    if (isSessionActive && currentSession && !sessionStartTime) {
      setSessionStartTime(new Date(currentSession.start_time));
      onSessionStart?.();

      // Auto-create learning path for this session
      if (subject) {
        createLearningPathFromActivity({
          activityType,
          subject,
          resourceId,
          performanceData: {
            accuracy: cardsStudied > 0 ? correctAnswers / cardsStudied : 0,
            timeSpent: 0,
            difficulty: 'beginner'
          }
        });
      }
    } else if (!isSessionActive && sessionStartTime) {
      setSessionStartTime(null);
      onSessionEnd?.();
    }
  }, [isSessionActive, currentSession, sessionStartTime, onSessionStart, onSessionEnd, createLearningPathFromActivity, activityType, subject, resourceId, cardsStudied, correctAnswers]);

  // Update session performance when metrics change
  useEffect(() => {
    if (isSessionActive && currentSession && (cardsStudied > 0 || totalQuestions > 0)) {
      updateSessionWithPerformance({
        cards_reviewed: cardsStudied,
        cards_correct: correctAnswers,
        quiz_score: quizScore,
        quiz_total_questions: totalQuestions
      });

      // Record activity to reset inactivity timer
      recordStudyActivity({
        cards_studied: cardsStudied,
        correct_answers: correctAnswers,
        quiz_score: quizScore,
        timestamp: new Date().toISOString()
      });

      // Update learning path progress
      const accuracy = cardsStudied > 0 ? correctAnswers / cardsStudied : 0;
      const timeSpent = sessionStartTime ? (Date.now() - sessionStartTime.getTime()) / 1000 : 0;
      
      if (subject) {
        updateLearningPathProgress({
          sessionId: currentSession.id,
          subject,
          accuracy,
          timeSpent,
          completed: false
        });
      }
    }
  }, [cardsStudied, correctAnswers, quizScore, totalQuestions, isSessionActive, currentSession, updateSessionWithPerformance, recordStudyActivity, updateLearningPathProgress, subject, sessionStartTime]);

  const handleAdaptationAccepted = (adaptation: any) => {
    setAdaptationsApplied(prev => [...prev, adaptation]);
    
    // Record the adaptation acceptance
    recordStudyActivity({
      adaptation_applied: adaptation,
      timestamp: new Date().toISOString()
    });
  };

  // Don't show tracker until session is actually active
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
    <div className="space-y-4">
      {/* Main Session Tracker */}
      <Card className="border-mint-200 bg-gradient-to-r from-mint-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-mint-800">
                Active {activityType.charAt(0).toUpperCase() + activityType.slice(1)} Session
              </span>
              {adaptationsApplied.length > 0 && (
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                  <Brain className="h-3 w-3 mr-1" />
                  {adaptationsApplied.length} AI adaptations
                </Badge>
              )}
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

      {/* Adaptive Learning Integration */}
      <AdaptiveStudyTracker
        sessionData={{
          subject,
          accuracy: cardsStudied > 0 ? accuracy / 100 : 0,
          timeSpent: sessionStartTime ? (Date.now() - sessionStartTime.getTime()) / 1000 : 0,
          cardsReviewed: cardsStudied,
          isActive: isSessionActive
        }}
        onAdaptationAccepted={handleAdaptationAccepted}
      />
    </div>
  );
};

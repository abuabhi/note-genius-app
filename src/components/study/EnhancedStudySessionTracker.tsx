
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Target, TrendingUp, Brain } from 'lucide-react';

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
  triggerStudyActivity?: boolean;
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
  
  console.log('🔥 [CONFLICTING TRACKER] EnhancedStudySessionTracker is DISABLED to prevent session conflicts');
  console.log('🔥 [CONFLICTING TRACKER] All session management should go through SessionDock only');
  console.log('🔥 [CONFLICTING TRACKER] Props received:', {
    activityType,
    resourceId,
    resourceName,
    cardsStudied,
    correctAnswers,
    triggerStudyActivity
  });
  
  // DISABLED: This component was creating competing sessions with useAutoSessionManager
  // All session management should go through SessionDock/useBasicSessionTracker only
  
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="text-red-800 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4" />
            <strong>Enhanced Session Tracker Disabled</strong>
          </div>
          <p>
            This tracker was creating competing sessions. All session management 
            is now handled by SessionDock to prevent timer reset issues.
          </p>
          {resourceName && (
            <p className="mt-2 text-xs">
              Resource: {resourceName} ({activityType})
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

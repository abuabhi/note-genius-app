
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyPlan } from '@/types/studyPlanner';
import { useStudyPlanSession } from '@/hooks/useStudyPlanSession';
import { useUnifiedSessionTracker } from '@/hooks/useUnifiedSessionTracker';
import { Play, Square, Clock, BookOpen, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface StudyPlanCardProps {
  studyPlan: StudyPlan;
}

export const StudyPlanCard = ({ studyPlan }: StudyPlanCardProps) => {
  const { startStudyPlanSession, endStudyPlanSession, isStudyPlanActive } = useStudyPlanSession();
  const { elapsedSeconds, isActive } = useUnifiedSessionTracker();
  
  const isThisPlanActive = isStudyPlanActive(studyPlan.id);
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSessionToggle = async () => {
    if (isThisPlanActive) {
      await endStudyPlanSession();
    } else {
      await startStudyPlanSession(studyPlan);
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isThisPlanActive ? 'ring-2 ring-mint-500 border-mint-300' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {studyPlan.title}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span>{studyPlan.subject}</span>
              {studyPlan.topic && (
                <>
                  <span>•</span>
                  <span>{studyPlan.topic}</span>
                </>
              )}
            </div>
          </div>
          
          {isThisPlanActive && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-mint-600">
                <div className="w-2 h-2 bg-mint-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono font-semibold">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
              <Badge variant="secondary" className="bg-mint-100 text-mint-800 border-mint-200">
                Active Session
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(studyPlan.start_date), 'MMM d')} - {format(new Date(studyPlan.end_date), 'MMM d')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{studyPlan.total_duration_hours}h total</span>
            </div>
          </div>

          {studyPlan.study_days.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {studyPlan.study_days.map((day) => (
                <Badge key={day} variant="outline" className="text-xs capitalize">
                  {day.slice(0, 3)}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-500">
              Progress: {studyPlan.completion_percentage}%
            </div>
            
            <Button
              onClick={handleSessionToggle}
              className={
                isThisPlanActive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-mint-600 hover:bg-mint-700 text-white"
              }
              size="sm"
            >
              {isThisPlanActive ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  End Session
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyPlan } from '@/types/studyPlanner';
import { useStudyPlanSession } from '@/hooks/useStudyPlanSession';
import { useConvertStudyPlanToGoal } from '@/hooks/useConvertStudyPlanToGoal';
import { Play, Settings, Target, Calendar, Clock, BookOpen } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { GoalFormDialog } from '@/components/goals/GoalFormDialog';
import { SessionSettingsDialog } from './SessionSettingsDialog';

interface StudyPlanCardProps {
  studyPlan: StudyPlan;
}

export const StudyPlanCard = ({ studyPlan }: StudyPlanCardProps) => {
  const { startStudyPlanSession, isStudyPlanActive } = useStudyPlanSession();
  const { convertToGoal, isLoading: isConverting } = useConvertStudyPlanToGoal();
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  
  const isActive = isStudyPlanActive(studyPlan.id);
  const daysLeft = differenceInDays(new Date(studyPlan.end_date), new Date());
  const hoursPerDay = Math.round(studyPlan.total_duration_hours / 7);

  const handleStartSession = async () => {
    await startStudyPlanSession(studyPlan);
  };

  const handleSetGoal = async () => {
    try {
      await convertToGoal(studyPlan);
      setShowGoalDialog(false);
    } catch (error) {
      console.error('Error converting to goal:', error);
    }
  };

  return (
    <>
      <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
            {studyPlan.title}
          </CardTitle>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-mint-100 text-mint-800 border-mint-200">
              <BookOpen className="h-3 w-3 mr-1" />
              {studyPlan.subject}
            </Badge>
            {studyPlan.topic && (
              <Badge variant="outline" className="text-xs">
                {studyPlan.topic}
              </Badge>
            )}
          </div>

          {isActive && (
            <Badge className="bg-green-100 text-green-800 border-green-200 w-fit">
              Active Session
            </Badge>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Study Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{daysLeft} days left</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{hoursPerDay}h/day</span>
              </div>
            </div>

            {/* Date Range */}
            <div className="text-sm text-gray-600">
              {format(new Date(studyPlan.start_date), 'MMM d')} - {format(new Date(studyPlan.end_date), 'MMM d, yyyy')}
            </div>

            {/* Study Days */}
            {studyPlan.study_days.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {studyPlan.study_days.slice(0, 4).map((day) => (
                  <Badge key={day} variant="outline" className="text-xs">
                    {day.slice(0, 3)}
                  </Badge>
                ))}
                {studyPlan.study_days.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{studyPlan.study_days.length - 4} more
                  </Badge>
                )}
              </div>
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{studyPlan.completion_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-mint-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${studyPlan.completion_percentage}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleStartSession}
                className="flex-1 bg-mint-600 hover:bg-mint-700 text-white"
                disabled={isActive}
              >
                <Play className="h-4 w-4 mr-2" />
                {isActive ? 'Session Active' : 'Start Session'}
              </Button>
              
              <Button
                onClick={() => setShowGoalDialog(true)}
                variant="outline"
                size="sm"
                disabled={isConverting || studyPlan.is_converted_to_goals}
                className="border-mint-200 text-mint-700 hover:bg-mint-50"
              >
                <Target className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => setShowSettingsDialog(true)}
                variant="outline"
                size="sm"
                className="border-gray-200 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Creation Dialog */}
      <GoalFormDialog
        open={showGoalDialog}
        onOpenChange={setShowGoalDialog}
        onSubmit={handleSetGoal}
        initialData={{
          title: `${studyPlan.title} - Study Goal`,
          description: `Converted from study plan: ${studyPlan.title}`,
          subject: studyPlan.subject,
          target_hours: studyPlan.total_duration_hours,
          start_date: studyPlan.start_date,
          end_date: studyPlan.end_date
        }}
      />

      {/* Session Settings Dialog */}
      <SessionSettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        studyPlan={studyPlan}
      />
    </>
  );
};

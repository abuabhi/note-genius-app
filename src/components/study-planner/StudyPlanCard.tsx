
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyPlan } from '@/types/studyPlanner';
import { useStudyPlanSession } from '@/hooks/useStudyPlanSession';
import { useConvertStudyPlanToGoal } from '@/hooks/useConvertStudyPlanToGoal';
import { Play, Settings, Target, Calendar, Clock } from 'lucide-react';
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

  const handleSetGoal = async (data: any) => {
    try {
      await convertToGoal(studyPlan);
    } catch (error) {
      console.error('Error converting to goal:', error);
    }
  };

  return (
    <>
      <Card className="bg-white border border-gray-100 hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-medium text-gray-900 mb-2">
                {studyPlan.title}
              </CardTitle>
              
              <Badge className="bg-mint-50 text-mint-700 border-mint-200 text-sm">
                {studyPlan.subject}
              </Badge>
            </div>

            {isActive && (
              <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                Active
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Study Info - Clean Grid */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Calendar className="h-3 w-3" />
                </div>
                <div className="font-medium text-gray-900">{daysLeft}</div>
                <div className="text-xs text-gray-500">days left</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Clock className="h-3 w-3" />
                </div>
                <div className="font-medium text-gray-900">{hoursPerDay}h</div>
                <div className="text-xs text-gray-500">per day</div>
              </div>
              
              <div className="text-center">
                <div className="font-medium text-gray-900">{studyPlan.sessions_completed}</div>
                <div className="text-xs text-gray-500">sessions</div>
              </div>
            </div>

            {/* Date Range */}
            <div className="text-xs text-gray-500 text-center">
              {format(new Date(studyPlan.start_date), 'MMM d')} - {format(new Date(studyPlan.end_date), 'MMM d, yyyy')}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{studyPlan.completion_percentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
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
                className="flex-1 bg-mint-600 hover:bg-mint-700 text-white h-9"
                disabled={isActive}
              >
                <Play className="h-4 w-4 mr-2" />
                {isActive ? 'Active' : 'Start'}
              </Button>
              
              <Button
                onClick={() => setShowGoalDialog(true)}
                variant="outline"
                size="sm"
                disabled={isConverting || studyPlan.is_converted_to_goals}
                className="border-mint-200 text-mint-700 hover:bg-mint-50 h-9 px-3"
              >
                <Target className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => setShowSettingsDialog(true)}
                variant="outline"
                size="sm"
                className="border-gray-200 hover:bg-gray-50 h-9 px-3"
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

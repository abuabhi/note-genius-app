
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyPlan } from '@/types/studyPlanner';
import { useStudyPlanSession } from '@/hooks/useStudyPlanSession';
import { useConvertStudyPlanToGoal } from '@/hooks/useConvertStudyPlanToGoal';
import { Play, Settings, Target, Calendar, Clock, BookOpen, TrendingUp } from 'lucide-react';
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
      <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-mint-50/30 to-blue-50/20 border border-mint-100 hover:border-mint-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-mint-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardContent className="relative p-6 space-y-4">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-mint-900 group-hover:text-mint-800 transition-colors line-clamp-2 mb-2">
                {studyPlan.title}
              </h3>
              
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-mint-100 to-mint-50 text-mint-800 border-mint-200 font-medium">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {studyPlan.subject}
                </Badge>
                
                {isActive && (
                  <Badge className="bg-gradient-to-r from-green-100 to-emerald-50 text-green-800 border-green-200 font-medium animate-pulse">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 py-3">
            <div className="text-center p-3 bg-white/60 rounded-lg border border-mint-100/50 group-hover:bg-white/80 transition-colors">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-4 w-4 text-mint-600" />
              </div>
              <div className="text-xl font-bold text-mint-800">{daysLeft}</div>
              <div className="text-xs text-mint-600 font-medium">days left</div>
            </div>
            
            <div className="text-center p-3 bg-white/60 rounded-lg border border-blue-100/50 group-hover:bg-white/80 transition-colors">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-blue-800">{hoursPerDay}h</div>
              <div className="text-xs text-blue-600 font-medium">per day</div>
            </div>
            
            <div className="text-center p-3 bg-white/60 rounded-lg border border-purple-100/50 group-hover:bg-white/80 transition-colors">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-purple-800">{studyPlan.sessions_completed}</div>
              <div className="text-xs text-purple-600 font-medium">sessions</div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2 p-3 bg-gradient-to-r from-mint-50/80 to-blue-50/50 rounded-lg border border-mint-100/50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-mint-800">Progress</span>
              <span className="text-sm font-bold text-mint-900">{studyPlan.completion_percentage}%</span>
            </div>
            <div className="w-full bg-mint-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-mint-500 to-mint-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${studyPlan.completion_percentage}%` }}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center justify-center py-2">
            <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full border">
              {format(new Date(studyPlan.start_date), 'MMM d')} - {format(new Date(studyPlan.end_date), 'MMM d, yyyy')}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleStartSession}
              disabled={isActive}
              className="flex-1 bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-medium"
            >
              <Play className="h-4 w-4 mr-2" />
              {isActive ? 'Active Session' : 'Start Session'}
            </Button>
            
            <Button
              onClick={() => setShowGoalDialog(true)}
              variant="outline"
              size="sm"
              disabled={isConverting || studyPlan.is_converted_to_goals}
              className="border-mint-200 text-mint-700 hover:bg-gradient-to-r hover:from-mint-50 hover:to-mint-100 hover:border-mint-300 transition-all duration-200 rounded-lg"
            >
              <Target className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={() => setShowSettingsDialog(true)}
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>
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

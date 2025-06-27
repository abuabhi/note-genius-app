
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyPlan } from '@/types/studyPlanner';
import { useStudyPlanSession } from '@/hooks/useStudyPlanSession';
import { useConvertStudyPlanToGoal } from '@/hooks/useConvertStudyPlanToGoal';
import { Play, Settings, Target, Calendar, Clock, BookOpen, TrendingUp, Hash } from 'lucide-react';
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
      <Card className="group relative cursor-pointer transition-all duration-300 ease-out bg-white border border-gray-200/60 hover:border-mint-300/60 hover:shadow-lg hover:shadow-mint-500/10 hover:-translate-y-0.5 rounded-xl overflow-hidden">
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-mint-50/20 pointer-events-none" />
        
        <CardContent className="relative p-5 space-y-4">
          {/* Header Section */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title */}
              <h3 className="font-semibold text-green-700 text-base leading-tight line-clamp-2">
                {studyPlan.title}
              </h3>
              
              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Subject Badge */}
                <Badge className="bg-mint-100 text-mint-800 border-mint-200 border text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm">
                  <BookOpen className="h-3 w-3 mr-1.5" />
                  {studyPlan.subject}
                </Badge>
                
                {/* Topic Badge */}
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 border text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm">
                  <Hash className="h-3 w-3 mr-1.5" />
                  {studyPlan.topic}
                </Badge>
                
                {/* Active Badge */}
                {isActive && (
                  <Badge className="bg-gradient-to-r from-green-100 to-emerald-50 text-green-800 border-green-200 font-medium animate-pulse px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1.5" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Days Left */}
            <div className="flex items-center gap-1.5 text-xs text-green-600">
              <Calendar className="h-3 w-3" />
              <span className="truncate font-medium">{daysLeft} days left</span>
            </div>
            
            {/* Hours Per Day */}
            <div className="flex items-center gap-1.5 text-xs text-blue-600">
              <Clock className="h-3 w-3" />
              <span className="truncate font-medium">{hoursPerDay}h per day</span>
            </div>
            
            {/* Sessions Completed */}
            <div className="flex items-center gap-1.5 text-xs text-purple-600">
              <TrendingUp className="h-3 w-3" />
              <span className="truncate font-medium">{studyPlan.sessions_completed} sessions</span>
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
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handleStartSession}
              disabled={isActive}
              className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white px-4 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex-1"
            >
              <Play className="h-3 w-3 mr-1.5" />
              {isActive ? 'Active Session' : 'Start Session'}
            </Button>
            
            <Button
              onClick={() => setShowGoalDialog(true)}
              variant="outline"
              size="sm"
              disabled={isConverting || studyPlan.is_converted_to_goals}
              className="border-mint-200 text-mint-700 hover:bg-gradient-to-r hover:from-mint-50 hover:to-mint-100 hover:border-mint-300 transition-all duration-200 rounded-lg h-8 w-8 p-0"
            >
              <Target className="h-3 w-3" />
            </Button>
            
            <Button
              onClick={() => setShowSettingsDialog(true)}
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg h-8 w-8 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
        
        {/* Subtle bottom border for separation */}
        <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent" />
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

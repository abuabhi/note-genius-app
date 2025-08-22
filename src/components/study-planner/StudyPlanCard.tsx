
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyPlan } from '@/types/studyPlanner';
import { useStudyPlanSession } from '@/hooks/useStudyPlanSession';
import { useConvertStudyPlanToGoal } from '@/hooks/useConvertStudyPlanToGoal';
import { useStudyPlannerAnalytics } from '@/hooks/useStudyPlannerAnalytics';
import { useStudyPlanProgress } from '@/hooks/useStudyPlanProgress';
import { useStudyPlanActions } from '@/hooks/useStudyPlanActions';
import { useDeleteStudyPlan } from '@/hooks/useDeleteStudyPlan';
import { Play, Calendar, Clock, BookOpen, TrendingUp, Hash, AlertTriangle, RotateCcw, CheckCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { GoalFormDialog } from '@/components/goals/GoalFormDialog';
import { SessionSettingsDialog } from './SessionSettingsDialog';
import { UnifiedDeleteDialog } from '@/components/ui/unified/UnifiedDeleteDialog';
import { ManualStudyTimeForm } from './ManualStudyTimeForm';
import { StudyPlanActionsMenu } from './StudyPlanActionsMenu';

interface StudyPlanCardProps {
  studyPlan: StudyPlan;
}

export const StudyPlanCard = ({ studyPlan }: StudyPlanCardProps) => {
  const { startStudyPlanSession, isStudyPlanActive } = useStudyPlanSession();
  const { convertToGoal, isLoading: isConverting } = useConvertStudyPlanToGoal();
  const { analytics } = useStudyPlannerAnalytics(studyPlan.id); // Get plan-specific analytics
  const { data: progress } = useStudyPlanProgress(studyPlan.id);
  const { extendPlan, completePlan, isExtending, isCompleting } = useStudyPlanActions();
  const { deleteStudyPlan, isLoading: isDeleting } = useDeleteStudyPlan();
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const manualStudyTriggerRef = useRef<HTMLButtonElement>(null);
  
  const isActive = isStudyPlanActive(studyPlan.id);
  const daysLeft = differenceInDays(new Date(studyPlan.end_date), new Date());
  const hoursPerDay = Math.round(studyPlan.total_duration_hours / 7);
  
  // Check if plan is overdue
  const isOverdue = daysLeft < 0;
  const isDueSoon = daysLeft <= 3 && daysLeft >= 0;

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

  const handleExtendPlan = () => {
    // Extend by 2 weeks from current end date
    const currentEndDate = new Date(studyPlan.end_date);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + 14);
    
    extendPlan({
      planId: studyPlan.id,
      newEndDate: newEndDate.toISOString().split('T')[0]
    });
  };

  const handleCompletePlan = () => {
    completePlan(studyPlan.id);
  };

  const handleDeletePlan = async () => {
    await deleteStudyPlan(studyPlan.id);
  };

  // Format time display - show hours and minutes for better readability
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get appropriate styling based on status
  const getCardStyling = () => {
    if (isOverdue) {
      return "group relative cursor-pointer transition-all duration-300 ease-out bg-red-50 border border-red-200 hover:border-red-300 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5 rounded-xl overflow-hidden";
    }
    if (isDueSoon) {
      return "group relative cursor-pointer transition-all duration-300 ease-out bg-orange-50 border border-orange-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 rounded-xl overflow-hidden";
    }
    return "group relative cursor-pointer transition-all duration-300 ease-out bg-white border border-gray-200/60 hover:border-mint-300/60 hover:shadow-lg hover:shadow-mint-500/10 hover:-translate-y-0.5 rounded-xl overflow-hidden";
  };

  return (
    <>
      <Card className={getCardStyling()}>
        {/* Three Dots Menu - Top Right Corner */}
        <div className="absolute top-3 right-3 z-10">
          <StudyPlanActionsMenu
            studyPlan={studyPlan}
            isConverting={isConverting}
            isDeleting={isDeleting}
            onConvertToGoal={() => convertToGoal(studyPlan)}
            onSettings={() => setShowSettingsDialog(true)}
            onDelete={() => setShowDeleteDialog(true)}
          />
        </div>

        {/* Gradient overlay for depth */}
        <div className={`absolute inset-0 bg-gradient-to-br ${
          isOverdue 
            ? 'from-red-50/80 via-transparent to-red-100/20' 
            : isDueSoon 
            ? 'from-orange-50/80 via-transparent to-orange-100/20'
            : 'from-white/80 via-transparent to-mint-50/20'
        } pointer-events-none`} />
        
        <CardContent className="relative p-5 space-y-4 pr-12">
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
                
                {/* Status Badges */}
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 font-medium px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm">
                    <AlertTriangle className="h-3 w-3 mr-1.5" />
                    OVERDUE
                  </Badge>
                )}
                {isDueSoon && !isOverdue && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-medium px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm">
                    <AlertTriangle className="h-3 w-3 mr-1.5" />
                    DUE SOON
                  </Badge>
                )}
                {isActive && (
                  <Badge className="bg-gradient-to-r from-green-100 to-emerald-50 text-green-800 border-green-200 font-medium animate-pulse px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-1.5" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section with Plan-Specific Data */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Days Left/Overdue */}
            <div className={`flex items-center gap-1.5 text-xs ${
              isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-green-600'
            }`}>
              <Calendar className="h-3 w-3" />
              <span className="truncate font-medium">
                {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
              </span>
            </div>
            
            {/* Plan Total Study Time */}
            <div className="flex items-center gap-1.5 text-xs text-blue-600">
              <Clock className="h-3 w-3" />
              <span className="truncate font-medium">{formatTime(analytics.totalSessionTime)} total</span>
            </div>
            
            {/* Plan Sessions Count */}
            <div className="flex items-center gap-1.5 text-xs text-purple-600">
              <TrendingUp className="h-3 w-3" />
              <span className="truncate font-medium">{analytics.totalSessions} sessions</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2 p-3 bg-gradient-to-r from-mint-50/80 to-blue-50/50 rounded-lg border border-mint-100/50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-mint-800">Progress</span>
              <span className="text-sm font-bold text-mint-900">{progress?.completionPercentage || 0}%</span>
            </div>
            <div className="w-full bg-mint-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-mint-500 to-mint-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress?.completionPercentage || 0}%` }}
              />
            </div>
          </div>

          {/* Session Time Summary - Plan Specific with Online/Offline Breakdown */}
          <div className="space-y-2 p-3 bg-blue-50/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-xs text-blue-700 font-medium">This Plan Study Time</div>
              <div className="text-xs text-blue-700 font-bold">{formatTime(analytics.totalSessionTime)}</div>
            </div>
            
            {/* Online/Offline Breakdown */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-green-600">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Online: {formatTime(progress?.onlineSessionTime || 0)}
                </span>
                <span className="text-blue-600">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  Offline: {formatTime(progress?.offlineSessionTime || 0)}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-blue-700">
              <strong>This Week:</strong> {formatTime(analytics.weeklySessionTime)}
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center justify-center py-2">
            <div className="text-xs text-gray-600 bg-gray-50 px-3 py-1 rounded-full border">
              {format(new Date(studyPlan.start_date), 'MMM d')} - {format(new Date(studyPlan.end_date), 'MMM d, yyyy')}
            </div>
          </div>

          {/* Action Buttons */}
          {isOverdue ? (
            // Overdue plan actions
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExtendPlan}
                  disabled={isExtending}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex-1"
                >
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                  {isExtending ? 'Extending...' : 'Extend +2 weeks'}
                </Button>
                
                <Button
                  onClick={handleCompletePlan}
                  disabled={isCompleting}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex-1"
                >
                  <CheckCircle className="h-3 w-3 mr-1.5" />
                  {isCompleting ? 'Completing...' : 'Mark Complete'}
                </Button>
              </div>
              
              {/* Add Offline Study Time Button - Always visible */}
              <Button
                onClick={() => manualStudyTriggerRef.current?.click()}
                variant="outline"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 px-3 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Clock className="h-3 w-3 mr-1.5" />
                Add Offline Study Time
              </Button>
              
              <div className="text-xs text-red-600 text-center bg-red-50 py-1 px-2 rounded border border-red-200">
                This plan is overdue. Extend the deadline or mark it as complete.
              </div>
            </div>
          ) : (
            // Normal plan actions
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleStartSession}
                  disabled={isActive}
                  className="bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800 text-white px-4 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex-1"
                >
                  <Play className="h-3 w-3 mr-1.5" />
                  {isActive ? 'Active Session' : 'Start Online Session'}
                </Button>
              </div>
              
              {/* Add Offline Study Time Button - Always visible */}
              <Button
                onClick={() => manualStudyTriggerRef.current?.click()}
                variant="outline"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 px-3 py-2 h-8 text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Clock className="h-3 w-3 mr-1.5" />
                Add Offline Study Time
              </Button>
            </div>
          )}
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

      {/* Manual Study Time Form */}
      <ManualStudyTimeForm 
        studyPlan={studyPlan}
        trigger={
          <Button ref={manualStudyTriggerRef} className="hidden">
            Add Offline Study
          </Button>
        }
      />

      {/* Delete Confirmation Dialog */}
      <UnifiedDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePlan}
        title="Delete Study Plan"
        itemName={studyPlan.title}
        itemType="study plan"
        description={`Are you sure you want to delete "${studyPlan.title}"? This will permanently remove the study plan and all associated session data.`}
      />
    </>
  );
};

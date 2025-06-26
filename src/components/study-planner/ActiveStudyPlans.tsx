
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Clock, Play, MoreHorizontal, Target, Trash2 } from 'lucide-react';
import { useActiveStudyPlans } from '@/hooks/useActiveStudyPlans';
import { useDeleteStudyPlan } from '@/hooks/useDeleteStudyPlan';
import { StudyPlan } from '@/types/studyPlanner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface ActiveStudyPlansProps {
  showAll: boolean;
}

export const ActiveStudyPlans = ({ showAll }: ActiveStudyPlansProps) => {
  const { studyPlans, isLoading } = useActiveStudyPlans();
  const { deleteStudyPlan, isLoading: isDeleting } = useDeleteStudyPlan();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<StudyPlan | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Study Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const plansToShow = showAll ? studyPlans : studyPlans.slice(0, 3);

  if (plansToShow.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Study Plans</h3>
        <p className="text-gray-600 mb-4">Create your first study plan to start organizing your learning journey.</p>
      </div>
    );
  }

  const handleDeleteClick = (plan: StudyPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (planToDelete) {
      try {
        await deleteStudyPlan(planToDelete.id);
        setDeleteDialogOpen(false);
        setPlanToDelete(null);
      } catch (error) {
        console.error('Error deleting plan:', error);
      }
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Study Plans</h2>
          {!showAll && studyPlans.length > 3 && (
            <Button variant="outline" size="sm">
              View All ({studyPlans.length})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plansToShow.map((plan) => (
            <StudyPlanCard 
              key={plan.id} 
              plan={plan} 
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{planToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const StudyPlanCard = ({ plan, onDeleteClick }: { 
  plan: StudyPlan; 
  onDeleteClick: (plan: StudyPlan) => void;
}) => {
  const startDate = new Date(plan.start_date);
  const endDate = new Date(plan.end_date);
  const now = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysPassed);

  const handleStartSession = () => {
    toast.success(`Starting study session for ${plan.title}`);
    // TODO: Navigate to study session page or create session
  };

  const handleConvertToGoal = () => {
    toast.success(`Converting "${plan.title}" to goals`);
    // TODO: Implement conversion to goals
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-white to-mint-50/30 shadow-sm hover:shadow-mint-200/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-mint-700 mb-2 group-hover:text-mint-800 transition-colors">
              {plan.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-mint-100 text-mint-700 hover:bg-mint-200 transition-colors">
                {plan.subject}
              </Badge>
              {plan.topic && (
                <Badge variant="outline" className="text-xs border-mint-300 text-mint-600">
                  {plan.topic}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStartSession}>
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDeleteClick(plan)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{plan.completion_percentage}%</span>
          </div>
          <Progress value={plan.completion_percentage} className="h-2 bg-mint-100" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-mint-500" />
            <span>{daysRemaining} days left</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-mint-500" />
            <span>{plan.daily_duration_minutes}min/day</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-mint-100">
          <span>{plan.sessions_completed} sessions</span>
          <span>{plan.study_days.length} days/week</span>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleStartSession}
            className="flex-1 bg-mint-600 hover:bg-mint-700 text-white shadow-sm hover:shadow-md transition-all"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Session
          </Button>
          <Button 
            onClick={handleConvertToGoal}
            variant="outline" 
            size="sm"
            className="border-mint-300 text-mint-700 hover:bg-mint-50 hover:border-mint-400"
          >
            <Target className="h-4 w-4 mr-1" />
            Goals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

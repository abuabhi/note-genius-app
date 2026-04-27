
import { format, addWeeks } from 'date-fns';
import { CalendarClock, Clock, Edit, Trash2, Trophy, Zap, Star, Calendar, CheckCircle, Info } from 'lucide-react';
import { StudyGoal } from '@/hooks/useStudyGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGoalActions } from '@/hooks/useGoalActions';

interface GoalCardProps {
  goal: StudyGoal;
  onEdit: (goal: StudyGoal) => void;
  onDelete: (goalId: string) => Promise<boolean>;
}

export const GoalCard = ({ goal, onEdit, onDelete }: GoalCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { extendGoal, markGoalComplete, isExtending, isCompleting } = useGoalActions();

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(goal.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleExtendGoal = () => {
    const newEndDate = addWeeks(new Date(goal.end_date), 2);
    extendGoal({ goalId: goal.id, newEndDate: newEndDate.toISOString().split('T')[0] });
  };

  const handleMarkComplete = () => {
    markGoalComplete(goal.id);
  };
  
  const startDate = new Date(goal.start_date);
  const endDate = new Date(goal.end_date);
  const today = new Date();
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const isOverdue = daysLeft < 0 && !goal.is_completed;
  const isAlmostDue = daysLeft <= 3 && daysLeft >= 0 && !goal.is_completed;

  // Enhanced motivational message that doesn't show for 0% progress
  const getMotivationalMessage = () => {
    if (goal.is_completed) return "🎉 Goal completed! Amazing work!";
    if (goal.progress >= 90) return "🔥 Almost there! Final push!";
    if (goal.progress >= 75) return "⭐ Great progress! Keep it up!";
    if (goal.progress >= 50) return "💪 Halfway there! You're doing great!";
    if (goal.progress >= 25) return "🚀 Good start! Keep going!";
    return null; // No message for 0% progress
  };

  // Enhanced reward points with milestone bonuses
  const getRewardPoints = () => {
    let basePoints = 0;
    
    if (goal.is_completed) {
      basePoints = goal.target_hours * 10;
      
      // Early completion bonus
      if (daysLeft > 0) {
        basePoints += Math.floor(daysLeft * 2); // 2 bonus points per day early
      }
      
      // Goal difficulty bonus
      if (goal.target_hours >= 40) {
        basePoints += 50; // Advanced goal bonus
      } else if (goal.target_hours >= 20) {
        basePoints += 25; // Intermediate goal bonus
      }
    } else {
      // Progressive points for milestones
      const milestonePoints = Math.floor(goal.progress / 25) * (goal.target_hours * 2);
      basePoints = milestonePoints;
    }
    
    return basePoints;
  };

  const getMilestoneIndicator = () => {
    if (goal.progress >= 75 && goal.progress < 100) {
      return "🏆 Final stretch!";
    } else if (goal.progress >= 50 && goal.progress < 75) {
      return "⭐ Halfway champion!";
    } else if (goal.progress >= 25 && goal.progress < 50) {
      return "🚀 Great start!";
    }
    return null;
  };

  const motivationalMessage = getMotivationalMessage();
  const milestoneIndicator = getMilestoneIndicator();
  
  return (
    <>
      <Card className={
        goal.is_completed 
          ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100" 
          : isOverdue 
            ? "border-red-500 bg-gradient-to-br from-red-50 to-red-100" 
            : isAlmostDue 
              ? "border-amber-500 bg-gradient-to-br from-amber-50 to-amber-100" 
              : "bg-gradient-to-br from-white to-gray-50"
      }>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <div className="flex space-x-1">
              {goal.is_completed && (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                  <Trophy className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">
                  Overdue
                </Badge>
              )}
              {isAlmostDue && !goal.is_completed && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                  Due Soon
                </Badge>
              )}
              {goal.subject && (
                <Badge variant="secondary">{goal.subject}</Badge>
              )}
            </div>
          </div>
          <CardDescription>{goal.description}</CardDescription>
          
          {/* Motivational message - only show if not null */}
          {motivationalMessage && (
            <div className="mt-2 p-2 bg-white/60 rounded-md border border-gray-200">
              <p className="text-xs text-center font-medium text-gray-700">
                {motivationalMessage}
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3 pb-2">
          <div>
            <div className="flex justify-between mb-1 text-xs text-gray-500">
              <span>Progress {milestoneIndicator && `• ${milestoneIndicator}`}</span>
              <span>{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-3" />
          </div>

          {/* Enhanced reward points section */}
          <div className="flex items-center justify-between p-2 bg-white/60 rounded-md border border-gray-200">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Reward Points</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="What are reward points?"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-72 text-xs leading-relaxed">
                  <p className="font-semibold mb-1 text-sm">How Reward Points work</p>
                  <p className="text-muted-foreground">
                    Earn points as you hit progress milestones (25%, 50%, 75%) and big bonus points for finishing the goal — plus an early-bird bonus for completing before the due date.
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    They're motivational badges to celebrate consistency — nothing to redeem.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-1">
              {getRewardPoints() === 0 && !goal.is_completed ? (
                <span className="text-xs text-muted-foreground italic">Earn by making progress</span>
              ) : (
                <>
                  <span className="text-sm font-bold text-yellow-600">{getRewardPoints()}</span>
                  <span className="text-xs text-gray-500">pts</span>
                </>
              )}
              {goal.is_completed && daysLeft > 0 && (
                <Badge variant="outline" className="ml-1 text-xs bg-green-50 text-green-700">
                  +{Math.floor(daysLeft * 2)} early bonus
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{goal.target_hours} hours target</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span>
                {daysLeft > 0 
                  ? `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left` 
                  : goal.is_completed 
                    ? 'Completed' 
                    : 'Overdue'}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <div>From: {format(new Date(goal.start_date), 'MMM dd, yyyy')}</div>
            <div>To: {format(new Date(goal.end_date), 'MMM dd, yyyy')}</div>
          </div>

          {/* Progress encouragement - only show if there's actual progress */}
          {goal.progress > 0 && goal.progress < 100 && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-blue-700">
                Automatically tracked from your study sessions!
              </span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-2">
          <div className="w-full space-y-2">
            {/* Quick action buttons for overdue/almost due goals */}
            {(isOverdue || isAlmostDue) && !goal.is_completed && (
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExtendGoal}
                  disabled={isExtending}
                  className="flex-1"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {isExtending ? 'Extending...' : 'Extend +2 weeks'}
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleMarkComplete}
                  disabled={isCompleting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  {isCompleting ? 'Completing...' : 'Mark Complete'}
                </Button>
              </div>
            )}
            
            {/* Regular action buttons */}
            <div className="flex justify-end gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(goal)}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{goal.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

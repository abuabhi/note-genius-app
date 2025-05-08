
import { format } from 'date-fns';
import { CalendarClock, Clock, Edit, Trash2 } from 'lucide-react';
import { StudyGoal } from '@/hooks/useStudyGoals';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface GoalCardProps {
  goal: StudyGoal;
  onEdit: (goal: StudyGoal) => void;
  onDelete: (goalId: string) => Promise<boolean>;
}

export const GoalCard = ({ goal, onEdit, onDelete }: GoalCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(goal.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };
  
  const startDate = new Date(goal.start_date);
  const endDate = new Date(goal.end_date);
  const today = new Date();
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const isOverdue = daysLeft < 0 && !goal.is_completed;
  const isAlmostDue = daysLeft <= 3 && daysLeft >= 0 && !goal.is_completed;
  
  return (
    <>
      <Card className={
        goal.is_completed 
          ? "border-green-500 bg-green-50" 
          : isOverdue 
            ? "border-red-500 bg-red-50" 
            : isAlmostDue 
              ? "border-amber-500 bg-amber-50" 
              : ""
      }>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            <div className="flex space-x-1">
              {goal.is_completed && (
                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
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
        </CardHeader>
        
        <CardContent className="space-y-3 pb-2">
          <div>
            <div className="flex justify-between mb-1 text-xs text-gray-500">
              <span>Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
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
        </CardContent>
        
        <CardFooter className="pt-2">
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

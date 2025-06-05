
import { PlusCircle, Target } from 'lucide-react';
import { StudyGoal } from '@/hooks/useStudyGoals';
import { GoalCard } from './GoalCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface GoalsGridProps {
  goals: StudyGoal[];
  loading: boolean;
  searchQuery: string;
  filter: string;
  onEditGoal: (goal: StudyGoal) => void;
  onDeleteGoal: (goalId: string) => Promise<boolean>;
  onCreateGoal: () => void;
}

export const GoalsGrid = ({ 
  goals, 
  loading, 
  searchQuery, 
  filter, 
  onEditGoal, 
  onDeleteGoal, 
  onCreateGoal 
}: GoalsGridProps) => {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-md p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-2 w-full mb-2" />
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
        <Target className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="font-medium text-lg mb-1">No goals found</h3>
        <p className="text-muted-foreground text-sm mb-4">
          {searchQuery || filter !== 'all' 
            ? "No goals match your current filters. Try adjusting your search." 
            : "Start by creating your first study goal or try a suggested goal above. Progress will be tracked automatically!"}
        </p>
        <Button 
          onClick={onCreateGoal}
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Create Goal
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {goals.map(goal => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={onEditGoal}
          onDelete={onDeleteGoal}
        />
      ))}
    </div>
  );
};

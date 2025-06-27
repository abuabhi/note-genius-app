
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus, Calendar, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useStudyGoals } from "@/hooks/useStudyGoals";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";

export const GoalsSection = () => {
  const { goals, loading } = useStudyGoals();
  
  // Filter to active goals and sort by due date (most urgent first)
  const activeGoals = goals
    .filter(goal => !goal.is_completed && goal.status !== 'archived')
    .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())
    .slice(0, 3); // Show only top 3 most urgent goals

  const formatDaysLeft = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="p-3 border rounded-lg">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <Target className="h-12 w-12 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
            <p className="text-gray-500 mb-4">
              Set your first study goal to track your progress and stay motivated.
            </p>
            <Button asChild>
              <Link to="/goals">
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Active Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeGoals.map(goal => {
          const daysLeft = differenceInDays(new Date(goal.end_date), new Date());
          const isOverdue = daysLeft < 0;
          
          return (
            <div key={goal.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm line-clamp-1">{goal.title}</h4>
                <Badge 
                  variant={isOverdue ? "destructive" : daysLeft <= 3 ? "outline" : "secondary"}
                  className="text-xs"
                >
                  {formatDaysLeft(goal.end_date)}
                </Badge>
              </div>
              
              {goal.subject && (
                <div className="flex items-center gap-1 mb-2">
                  <BookOpen className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{goal.subject}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${getProgressColor(goal.progress)}`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600">
                  {goal.progress}%
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{goal.target_hours}h target</span>
                <span>Due {format(new Date(goal.end_date), 'MMM d')}</span>
              </div>
            </div>
          );
        })}
        
        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <Link to="/goals" className="text-sm">
              View All Goals
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

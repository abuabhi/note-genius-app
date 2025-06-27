
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
    if (progress >= 80) return 'bg-gradient-to-r from-mint-400 to-mint-500';
    if (progress >= 50) return 'bg-gradient-to-r from-mint-300 to-mint-400';
    return 'bg-gradient-to-r from-mint-200 to-mint-300';
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-mint-50/50 to-white border-mint-200/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg shadow-sm">
              <Target className="h-4 w-4 text-white" />
            </div>
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="p-3 border border-mint-100 rounded-lg bg-white/50">
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
      <Card className="bg-gradient-to-br from-mint-50/50 to-white border-mint-200/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg shadow-sm">
              <Target className="h-4 w-4 text-white" />
            </div>
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="p-3 bg-mint-100 rounded-full w-fit mx-auto">
                <Target className="h-8 w-8 text-mint-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
            <p className="text-gray-500 mb-4">
              Set your first study goal to track your progress and stay motivated.
            </p>
            <Button asChild className="bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 shadow-lg">
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
    <Card className="bg-gradient-to-br from-mint-50/50 to-white border-mint-200/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg shadow-sm">
            <Target className="h-4 w-4 text-white" />
          </div>
          Active Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeGoals.map(goal => {
          const daysLeft = differenceInDays(new Date(goal.end_date), new Date());
          const isOverdue = daysLeft < 0;
          
          return (
            <div key={goal.id} className="p-4 border border-mint-100 rounded-xl bg-gradient-to-br from-white to-mint-50/30 hover:from-mint-50/50 hover:to-mint-100/50 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-sm line-clamp-1 text-gray-800">{goal.title}</h4>
                <Badge 
                  variant={isOverdue ? "destructive" : daysLeft <= 3 ? "outline" : "secondary"}
                  className={`text-xs ${
                    isOverdue 
                      ? 'bg-red-100 text-red-700 border-red-200' 
                      : daysLeft <= 3 
                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                        : 'bg-mint-100 text-mint-700 border-mint-200'
                  }`}
                >
                  {formatDaysLeft(goal.end_date)}
                </Badge>
              </div>
              
              {goal.subject && (
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-3 w-3 text-mint-500" />
                  <span className="text-xs text-mint-600 font-medium">{goal.subject}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-mint-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(goal.progress)} shadow-sm`}
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-mint-700 bg-mint-50 px-2 py-1 rounded-full">
                  {goal.progress}%
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="text-mint-600 font-medium">{goal.target_hours}h target</span>
                <span>Due {format(new Date(goal.end_date), 'MMM d')}</span>
              </div>
            </div>
          );
        })}
        
        <div className="pt-3 border-t border-mint-100">
          <Button variant="ghost" size="sm" asChild className="w-full text-mint-600 hover:text-mint-700 hover:bg-mint-50">
            <Link to="/goals" className="text-sm font-medium">
              View All Goals
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

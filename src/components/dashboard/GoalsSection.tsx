
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  Target, 
  Trophy,
  ArrowRight,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { formatDistanceToNow, parseISO } from 'date-fns';

export const GoalsSection = () => {
  console.log('🎯 GoalsSection rendering');
  
  const { user } = useAuth();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['active-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching goals:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getCurrentHours = (goal: any) => {
    if (!goal.target_hours || goal.target_hours <= 0) return 0;
    return Math.round((goal.progress / 100) * goal.target_hours * 100) / 100;
  };

  const getProgressPercentage = (goal: any) => {
    return Math.min(goal.progress || 0, 100);
  };

  const getGoalStatus = (goal: any) => {
    const progress = getProgressPercentage(goal);
    if (progress >= 100) return { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' };
    if (progress >= 75) return { label: 'Almost There', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (progress >= 50) return { label: 'On Track', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'Getting Started', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  if (isLoading) {
    return (
      <Card className="h-[500px] animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="h-[500px] bg-blue-50 border-blue-200 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col justify-center text-center py-8">
            <Trophy className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Set Your First Goal!</h3>
            <p className="text-blue-600 mb-4">Create study goals to track your progress and stay motivated.</p>
          </div>
          <div className="pt-4 border-t mt-auto">
            <Button asChild className="w-full text-white">
              <Link to="/goals">
                <Target className="h-4 w-4 mr-2" />
                Manage Goals
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Active Goals
          <Badge variant="outline" className="ml-2 border-blue-300 text-blue-700">
            {goals.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4">
        <div className="flex-1 space-y-4 overflow-y-auto">
          {goals.map((goal) => {
            const currentHours = getCurrentHours(goal);
            const progress = getProgressPercentage(goal);
            const status = getGoalStatus(goal);
            
            return (
              <div key={goal.id} className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{goal.title}</div>
                    {goal.description && (
                      <div className="text-sm text-gray-600 mt-1">{goal.description}</div>
                    )}
                  </div>
                  <Badge variant="outline" className={status.color}>
                    {status.label}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {currentHours}h / {goal.target_hours}h
                    </span>
                    <span className="font-medium text-gray-900">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {goal.end_date && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Target: {formatDistanceToNow(parseISO(goal.end_date), { addSuffix: true })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t mt-auto">
          <Button asChild className="w-full text-white">
            <Link to="/goals">
              <Target className="h-4 w-4 mr-2" />
              Manage Goals
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

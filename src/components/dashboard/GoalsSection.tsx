
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export const GoalsSection = () => {
  const { user } = useAuth();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['dashboard-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-mint-600" />
            Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-mint-600" />
            Your Goals
            {goals.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {goals.length} active
              </Badge>
            )}
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link to="/goals">
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">No active goals</h3>
            <p className="text-gray-500 text-sm mb-4">
              Set your first study goal to start tracking your progress
            </p>
            <Button asChild>
              <Link to="/goals">
                <Target className="h-4 w-4 mr-2" />
                Create First Goal
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals
              .map((goal) => {
                // Calculate days left
                const endDate = new Date(goal.end_date);
                const today = new Date();
                const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                // Determine status
                const isOverdue = daysLeft < 0 && !goal.is_completed;
                const isAlmostDue = daysLeft <= 3 && daysLeft >= 0 && !goal.is_completed;
                
                return { ...goal, daysLeft, isOverdue, isAlmostDue };
              })
              .sort((a, b) => {
                // Sort overdue first, then almost due, then normal
                if (a.isOverdue && !b.isOverdue) return -1;
                if (!a.isOverdue && b.isOverdue) return 1;
                if (a.isAlmostDue && !b.isAlmostDue) return -1;
                if (!a.isAlmostDue && b.isAlmostDue) return 1;
                return 0;
              })
              .map((goal) => (
                <div 
                  key={goal.id} 
                  className={`p-4 rounded-lg border ${
                    goal.isOverdue
                      ? "bg-red-50 border-red-200"
                      : goal.isAlmostDue
                      ? "bg-orange-50 border-orange-200"
                      : "bg-gradient-to-r from-mint-50 to-blue-50 border-mint-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${
                          goal.isOverdue
                            ? "text-red-900"
                            : goal.isAlmostDue
                            ? "text-orange-900"
                            : "text-gray-900"
                        }`}>
                          {goal.title}
                        </h4>
                        {goal.isOverdue && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 text-xs">
                            Overdue
                          </Badge>
                        )}
                        {goal.isAlmostDue && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                            Due Soon
                          </Badge>
                        )}
                      </div>
                      <div className={`flex items-center gap-3 text-sm ${
                        goal.isOverdue
                          ? "text-red-600"
                          : goal.isAlmostDue
                          ? "text-orange-600"
                          : "text-gray-600"
                      }`}>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {goal.target_hours}h target
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {goal.progress || 0}% complete
                        </div>
                        <div className="flex items-center gap-1">
                          {goal.isOverdue ? (
                            <>
                              <AlertCircle className="h-3 w-3" />
                              {Math.abs(goal.daysLeft)} days overdue
                            </>
                          ) : goal.isAlmostDue ? (
                            <>
                              <Clock className="h-3 w-3" />
                              {goal.daysLeft} days left
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              {goal.daysLeft} days left
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            <div className="pt-2">
              <Button asChild variant="outline" className="w-full">
                <Link to="/goals">
                  View All Goals
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

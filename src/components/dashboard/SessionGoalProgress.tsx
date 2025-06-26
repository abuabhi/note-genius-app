
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Target, Calendar, TrendingUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export const SessionGoalProgress = () => {
  const { user } = useAuth();

  const { data: goalProgress = [] } = useQuery({
    queryKey: ['session-goal-progress', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get active goals with recent session activity
      const { data: goals, error } = await supabase
        .from('study_goals')
        .select(`
          id,
          title,
          subject,
          target_hours,
          progress,
          start_date,
          end_date,
          is_completed
        `)
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('end_date', { ascending: true })
        .limit(3);

      if (error) throw error;

      // Get recent session count for each goal's subject
      const goalsWithSessions = await Promise.all(
        (goals || []).map(async (goal) => {
          const { data: sessions, error: sessionsError } = await supabase
            .from('study_plan_sessions')
            .select('id, status, scheduled_date')
            .contains('completion_notes', `Linked to goal: ${goal.id}`)
            .gte('scheduled_date', format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));

          if (sessionsError) {
            console.error('Error fetching sessions:', sessionsError);
            return { ...goal, recentSessions: 0, daysLeft: 0 };
          }

          const daysLeft = differenceInDays(new Date(goal.end_date), new Date());

          return {
            ...goal,
            recentSessions: sessions?.length || 0,
            daysLeft: Math.max(0, daysLeft),
          };
        })
      );

      return goalsWithSessions;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (goalProgress.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goalProgress.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{goal.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {goal.subject && (
                    <Badge variant="outline" className="text-xs">
                      {goal.subject}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {goal.daysLeft} days left
                  </div>
                  {goal.recentSessions > 0 && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      {goal.recentSessions} sessions this week
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{goal.progress}%</div>
                <div className="text-xs text-gray-500">
                  {goal.target_hours}h target
                </div>
              </div>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

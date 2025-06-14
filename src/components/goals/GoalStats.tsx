
import React from 'react';
import { Target, Calendar, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudyGoal } from '@/hooks/useStudyGoals';

interface GoalStatsProps {
  goals: StudyGoal[];
  streakBonus: string | null;
}

export const GoalStats: React.FC<GoalStatsProps> = ({ goals, streakBonus }) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.is_completed).length;
  const activeGoals = goals.filter(goal => !goal.is_completed && goal.status !== 'archived').length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Calculate overdue goals
  const today = new Date();
  const overdueGoals = goals.filter(goal => {
    if (goal.is_completed || goal.status === 'archived') return false;
    const endDate = new Date(goal.end_date);
    return endDate < today;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Total Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">{totalGoals}</div>
          <p className="text-xs text-blue-600">All time goals</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-green-600" />
            Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800">{completedGoals}</div>
          <p className="text-xs text-green-600">{completionRate}% completion rate</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800">{activeGoals}</div>
          <p className="text-xs text-orange-600">In progress</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-purple-800">
            {streakBonus || 'Start your streak!'}
          </div>
          {overdueGoals > 0 && (
            <Badge variant="destructive" className="text-xs mt-1">
              {overdueGoals} overdue
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

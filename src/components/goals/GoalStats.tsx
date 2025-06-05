
import { Target, Trophy, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudyGoal } from '@/hooks/useStudyGoals';

interface GoalStatsProps {
  goals: StudyGoal[];
  streakBonus: number;
}

export const GoalStats = ({ goals, streakBonus }: GoalStatsProps) => {
  const completedGoalsCount = goals.filter(g => g.is_completed).length;
  const activeGoalsCount = goals.filter(g => !g.is_completed).length;

  // Calculate total reward points from all goals
  const getTotalRewardPoints = () => {
    return goals.reduce((total, goal) => {
      let goalPoints = 0;
      if (goal.is_completed) {
        goalPoints = goal.target_hours * 10;
        // Add bonus calculations
        if (goal.target_hours >= 40) goalPoints += 50;
        else if (goal.target_hours >= 20) goalPoints += 25;
      } else {
        goalPoints = Math.floor(goal.progress / 25) * (goal.target_hours * 2);
      }
      return total + goalPoints;
    }, 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">{activeGoalsCount}</div>
          <p className="text-xs text-blue-600">Auto-tracked from study sessions</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green-600" />
            Completed Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800">{completedGoalsCount}</div>
          <p className="text-xs text-green-600">Successfully achieved</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-orange-600" />
            Goal Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-800">{streakBonus}</div>
          <p className="text-xs text-orange-600">Consecutive completions</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-purple-600" />
            Total Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-800">{getTotalRewardPoints()}</div>
          <p className="text-xs text-purple-600">Reward points earned</p>
        </CardContent>
      </Card>
    </div>
  );
};

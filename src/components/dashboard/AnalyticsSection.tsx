
import { SharedStatsGrid } from "@/components/shared/SharedStatsGrid";
import { useUnifiedStudyStats } from "@/hooks/useUnifiedStudyStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target } from "lucide-react";

export const AnalyticsSection = () => {
  const { stats, isLoading } = useUnifiedStudyStats();

  // Calculate weekly goal progress (assume 5 hours per week goal)
  const weeklyGoalHours = 5;
  const weeklyProgress = Math.min(100, (stats.studyTimeHours / weeklyGoalHours) * 100);

  // Transform stats to match SharedStatsGrid interface
  const transformedStats = {
    totalHours: stats.studyTimeHours,
    averageDuration: stats.averageSessionTime,
    totalSessions: stats.totalSessions,
    activeSessions: 0, // We don't track active sessions in unified stats
    streakDays: stats.streakDays,
    totalCardsMastered: stats.totalCardsMastered,
    cardsReviewedToday: 0, // We don't track today's cards in unified stats
    todayStudyMinutes: 0, // We don't track today's study time in unified stats
  };

  return (
    <div className="space-y-8">
      {/* Quick Overview Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-mint-900">Your Learning Overview</h2>
        <SharedStatsGrid stats={transformedStats} isLoading={isLoading} variant="dashboard" />
      </div>
      
      {/* Weekly Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Weekly Study Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {stats.studyTimeHours}h / {weeklyGoalHours}h
              </span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <p className="text-xs text-gray-500">
              {Math.round(weeklyProgress)}% of weekly goal completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-mint-600" />
              Learning Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-mint-600 mb-2">
                {stats.streakDays}
              </div>
              <p className="text-sm text-gray-600">
                {stats.streakDays === 1 ? 'day' : 'days'} in a row
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Keep studying to maintain your streak!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

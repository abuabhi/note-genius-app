
import { SharedStatsGrid } from "@/components/shared/SharedStatsGrid";
import { useUnifiedStudyStats } from "@/hooks/useUnifiedStudyStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target } from "lucide-react";

export const AnalyticsSection = () => {
  const { stats, isLoading } = useUnifiedStudyStats();

  // Transform stats to match SharedStatsGrid interface
  const transformedStats = {
    totalHours: stats.studyTimeHours,
    averageDuration: stats.averageSessionTime,
    totalSessions: stats.totalSessions,
    activeSessions: stats.activeSessions.length,
    streakDays: stats.streakDays,
    totalCardsMastered: stats.totalCardsMastered,
    cardsReviewedToday: 0, // Not tracked in unified stats
    todayStudyMinutes: stats.todayStudyTimeMinutes,
  };

  // Format time helper
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="space-y-8">
      {/* Quick Overview Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-mint-900">Your Learning Overview</h2>
        <SharedStatsGrid stats={transformedStats} isLoading={isLoading} variant="dashboard" />
      </div>
      
      {/* Weekly Goal Progress and Streak */}
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
                {formatTime(stats.weeklyStudyTimeMinutes)} / {formatTime(stats.weeklyGoalMinutes)}
              </span>
            </div>
            <Progress value={stats.weeklyGoalProgress} className="h-3" />
            <p className="text-xs text-gray-500">
              {stats.weeklyGoalProgress}% of weekly goal completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-mint-600" />
              Study Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-mint-600 mb-2">
                {stats.weeklyChange > 0 ? '+' : ''}{stats.weeklyChange}%
              </div>
              <p className="text-sm text-gray-600">
                vs last week
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.weeklyStudyTimeMinutes > 0 ? 'Keep up the momentum!' : 'Time to get back on track!'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

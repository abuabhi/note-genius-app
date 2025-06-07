
import { StudyStatsOverview } from './StudyStatsOverview';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUnifiedStudyStats } from '@/hooks/useUnifiedStudyStats';
import { TrendingUp, Target, Clock, Calendar } from "lucide-react";

export const StudyAnalyticsDashboard = () => {
  const { stats, isLoading } = useUnifiedStudyStats();

  // Format time helper
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-mint-900">Study Analytics Overview</h2>
        <StudyStatsOverview />
      </div>
      
      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Study Goal</span>
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
              Performance Trend
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

      {/* Session Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.totalSessions}
              </div>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.averageSessionTime}m
              </div>
              <p className="text-sm text-gray-600">Avg Duration</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatTime(stats.studyTimeMinutes)}
              </div>
              <p className="text-sm text-gray-600">Total Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {stats.totalCardsMastered}
              </div>
              <p className="text-sm text-gray-600">Cards Mastered</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp,
  Flame,
  Clock
} from "lucide-react";
import { useConsolidatedAnalytics } from "@/hooks/useConsolidatedAnalytics";

export const LearningAnalyticsDashboard = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-mint-900">Today's Progress</h2>
      </div>
      
      {/* Essential Daily Metrics Only */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Study Time Today */}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-mint-50 to-white border-mint-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Study Time Today</CardTitle>
            <Clock className="h-4 w-4 text-mint-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(analytics.todayStudyTimeMinutes / 60)}h {analytics.todayStudyTimeMinutes % 60}m
            </div>
            <div className="text-sm text-mint-600 mt-1">
              Keep up the momentum!
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Study Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{analytics.streakDays}</div>
            <div className="text-sm text-orange-600 mt-1">
              {analytics.streakDays === 0 ? 'Start your streak today!' : 'days in a row'}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(analytics.weeklyStudyTimeMinutes / 60)}h
            </div>
            <div className="text-sm text-blue-600 mt-1">
              {analytics.weeklyChange > 0 ? `+${analytics.weeklyChange}%` : `${analytics.weeklyChange}%`} vs last week
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

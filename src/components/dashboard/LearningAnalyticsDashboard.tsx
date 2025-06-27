
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp,
  Flame,
  Clock,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { useConsolidatedAnalytics } from "@/hooks/useConsolidatedAnalytics";

export const LearningAnalyticsDashboard = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-mint-900">Today's Progress</h2>
        <Button variant="outline" size="sm" asChild className="text-mint-600 border-mint-200 hover:bg-mint-50">
          <Link to="/analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Full Analytics
          </Link>
        </Button>
      </div>
      
      {/* Simplified Stats Grid - Essential Daily Metrics Only */}
      <div className="grid gap-6 md:grid-cols-3">
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
            <div className="text-sm text-mint-600 mt-2">
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
            <div className="text-sm text-orange-600 mt-2">
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
            <div className="text-sm text-blue-600 mt-2">
              {analytics.weeklyChange > 0 ? `+${analytics.weeklyChange}%` : `${analytics.weeklyChange}%`} vs last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Study Actions - Simplified */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Button asChild className="h-auto p-4 bg-mint-600 hover:bg-mint-700 justify-start">
            <Link to="/flashcards" className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <div className="h-4 w-4 bg-white rounded"></div>
              </div>
              <div className="text-left">
                <div className="font-semibold">Continue Studying</div>
                <div className="text-xs opacity-90">Review flashcards and notes</div>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto p-4 border-mint-600 text-mint-700 hover:bg-mint-50 justify-start">
            <Link to="/analytics" className="flex items-center gap-3">
              <div className="p-2 bg-mint-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-mint-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold">View Analytics</div>
                <div className="text-xs opacity-90">Detailed progress insights</div>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

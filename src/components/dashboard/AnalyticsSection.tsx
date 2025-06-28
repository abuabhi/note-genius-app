
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Clock, Flame, Trophy, BookOpen } from "lucide-react";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";

export const AnalyticsSection = () => {
  const { analytics, isLoading } = useUltraSimpleAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-mint-50 h-32 rounded-lg border border-mint-200"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-pulse bg-mint-50 h-48 rounded-lg border border-mint-200"></div>
          <div className="animate-pulse bg-mint-50 h-48 rounded-lg border border-mint-200"></div>
        </div>
      </div>
    );
  }

  // Format time helper
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-mint-900 mb-2">Your Learning Analytics</h2>
        <p className="text-mint-600">Track your progress and build consistent study habits</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-blue-800 mb-1">
              {formatTime(analytics.weeklyStudyTimeMinutes)}
            </div>
            <p className="text-sm text-blue-600">This Week</p>
            {analytics.weeklyChange > 0 && (
              <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                +{analytics.weeklyChange}% vs last week
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200">
          <CardContent className="p-6 text-center">
            <Flame className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-mint-800 mb-1">
              {analytics.streakDays}
            </div>
            <p className="text-sm text-mint-600">Day Streak</p>
            {analytics.streakDays > 0 && (
              <Badge variant="secondary" className="mt-2 bg-orange-100 text-orange-700">
                Keep it going! 🔥
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-green-800 mb-1">
              {analytics.flashcardAccuracy}%
            </div>
            <p className="text-sm text-green-600">Accuracy</p>
            {analytics.flashcardAccuracy >= 80 && (
              <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                Excellent! 🎯
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-purple-800 mb-1">
              {analytics.totalSessions}
            </div>
            <p className="text-sm text-purple-600">Total Sessions</p>
            {analytics.weeklySessions > 0 && (
              <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-700">
                {analytics.weeklySessions} this week
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Goal Progress */}
        <Card className="border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-mint-600" />
              Weekly Study Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                {formatTime(analytics.weeklyStudyTimeMinutes)} / {formatTime(analytics.weeklyGoalMinutes)}
              </span>
            </div>
            <Progress 
              value={analytics.weeklyGoalProgress} 
              className="h-3"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-mint-700">
                {analytics.weeklyGoalProgress}% Complete
              </span>
              <span className={`text-sm font-medium ${
                analytics.weeklyGoalProgress >= 50 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {analytics.weeklyGoalProgress >= 50 ? '✅ On Track' : '⚠️ Needs Attention'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Performance Insights */}
        <Card className="border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-mint-600" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Session</span>
                <span className="font-medium text-gray-800">
                  {analytics.averageSessionTime}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Study Time</span>
                <span className="font-medium text-gray-800">
                  {analytics.totalStudyTime}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cards Mastered</span>
                <span className="font-medium text-gray-800">
                  {analytics.totalCardsMastered}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Flashcard Sets</span>
                <span className="font-medium text-gray-800">
                  {analytics.totalSets}
                </span>
              </div>
            </div>
            
            {analytics.weeklyChange !== 0 && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-4 w-4 ${
                    analytics.weeklyChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">
                    {analytics.weeklyChange > 0 ? '📈 Great improvement!' : '📉 Slight dip this week'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {analytics.weeklyChange > 0 ? '+' : ''}{analytics.weeklyChange}% compared to last week
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

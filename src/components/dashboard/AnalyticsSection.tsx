
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Clock, Flame, ArrowRight, Calendar, BookOpen } from "lucide-react";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";
import { useNavigate } from "react-router-dom";

export const AnalyticsSection = () => {
  const { analytics, isLoading } = useUltraSimpleAnalytics();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-mint-100 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-mint-50 rounded-xl border border-mint-200"></div>
            ))}
          </div>
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

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return "🔥";
    if (days >= 14) return "⚡";
    if (days >= 7) return "✨";
    if (days >= 3) return "💪";
    return "🌱";
  };

  const getWeeklyTrend = () => {
    const change = analytics.weeklyChange;
    if (change > 10) return { text: "Excellent!", color: "text-green-600", emoji: "🚀" };
    if (change > 0) return { text: "Growing", color: "text-green-600", emoji: "📈" };
    if (change === 0) return { text: "Steady", color: "text-blue-600", emoji: "➡️" };
    return { text: "Room to grow", color: "text-orange-600", emoji: "💪" };
  };

  const weeklyTrend = getWeeklyTrend();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Quick Analytics</h2>
          <p className="text-gray-600">Your learning progress at a glance</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/analytics')}
          className="border-mint-200 hover:bg-mint-50 text-mint-700 font-medium px-6"
        >
          View Detailed Analytics
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* This Week */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">This Week</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-800">
                {formatTime(analytics.weeklyStudyTimeMinutes)}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className={weeklyTrend.color}>{weeklyTrend.emoji}</span>
                <span className={`font-medium ${weeklyTrend.color}`}>
                  {weeklyTrend.text}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Streak */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Study Streak</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-800">
                {analytics.streakDays} {analytics.streakDays === 1 ? 'day' : 'days'}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-lg">{getStreakEmoji(analytics.streakDays)}</span>
                <span className="font-medium text-orange-600">
                  {analytics.streakDays >= 7 ? 'Amazing!' : analytics.streakDays >= 3 ? 'Great job!' : 'Keep going!'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy Rate */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Accuracy</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-800">
                {analytics.flashcardAccuracy}%
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-lg">
                  {analytics.flashcardAccuracy >= 90 ? '🎯' : analytics.flashcardAccuracy >= 75 ? '👍' : '💪'}
                </span>
                <span className="font-medium text-green-600">
                  {analytics.flashcardAccuracy >= 90 ? 'Excellent!' : analytics.flashcardAccuracy >= 75 ? 'Good work!' : 'Improving!'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Sessions</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-800">
                {analytics.totalSessions}
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-lg">📚</span>
                <span className="font-medium text-purple-600">
                  {analytics.totalSessions >= 50 ? 'Dedicated!' : analytics.totalSessions >= 20 ? 'Consistent!' : 'Getting started!'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="bg-gradient-to-r from-mint-50 to-blue-50 border-mint-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-mint-600" />
            Weekly Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {formatTime(analytics.weeklyStudyTimeMinutes)} of {analytics.weeklyGoalHours}h goal
              </span>
              <span className="font-bold text-mint-600">
                {analytics.weeklyGoalProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-mint-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, analytics.weeklyGoalProgress)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600">
              {analytics.weeklyGoalProgress >= 100 
                ? "🎉 Goal achieved! Amazing work!" 
                : analytics.weeklyGoalProgress >= 75 
                ? "🔥 Almost there! Keep it up!" 
                : analytics.weeklyGoalProgress >= 50 
                ? "💪 Halfway there! You got this!" 
                : "🌱 Great start! Every minute counts!"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

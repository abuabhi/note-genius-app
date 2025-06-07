
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Target, TrendingUp, Award } from "lucide-react";
import { useTimezoneAwareAnalytics } from "@/hooks/useTimezoneAwareAnalytics";
import { MetricDisplay } from "../shared/MetricDisplay";

export const ProgressOverviewCard = () => {
  const { analytics, isLoading } = useTimezoneAwareAnalytics();

  if (isLoading) {
    return (
      <Card className="w-full border-mint-200">
        <CardHeader>
          <div className="animate-pulse bg-mint-200 h-6 w-48 rounded"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-mint-200 rounded mb-2"></div>
              <div className="h-2 bg-mint-200 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Format time helper
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Calculate streaks and achievements
  const isOnTrack = analytics.weeklyGoalProgress >= 50;
  const weeklyTarget = formatTime(analytics.weeklyGoalMinutes);
  const weeklyProgress = formatTime(analytics.weeklyStudyTimeMinutes);
  const totalHours = Math.round((analytics.totalStudyTimeMinutes || 0) / 60 * 10) / 10;

  return (
    <Card className="w-full bg-gradient-to-br from-mint-50 to-blue-50 border-mint-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-mint-800 flex items-center gap-2">
          <Award className="h-6 w-6 text-mint-600" />
          Your Learning Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricDisplay
            label="Total Study Time"
            value={`${totalHours}h`}
            icon={Clock}
            color="blue"
            className="text-center"
          />
          
          <MetricDisplay
            label="Cards Mastered"
            value={analytics.totalCardsMastered}
            icon={Target}
            color="green"
            className="text-center"
          />
          
          <MetricDisplay
            label="Study Streak"
            value={analytics.streakDays}
            icon={TrendingUp}
            color="mint"
            className="text-center"
          />
        </div>

        {/* Weekly Goal Progress */}
        <div className="space-y-3 p-4 bg-white/60 rounded-lg border border-mint-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-mint-800">Weekly Goal Progress</h3>
            <span className="text-sm text-mint-600">{weeklyProgress} / {weeklyTarget}</span>
          </div>
          <Progress value={analytics.weeklyGoalProgress} className="h-3" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-mint-700">
              {analytics.weeklyGoalProgress}% Complete
            </span>
            <span className={`text-sm font-medium ${isOnTrack ? 'text-green-600' : 'text-orange-600'}`}>
              {isOnTrack ? '✅ On Track' : '⚠️ Needs Attention'}
            </span>
          </div>
        </div>

        {/* Weekly Comparison */}
        {analytics.weeklyChange !== 0 && (
          <div className="p-4 bg-white/60 rounded-lg border border-mint-100">
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${analytics.weeklyChange > 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-sm font-medium text-mint-700">
                {analytics.weeklyChange > 0 ? '📈 Great improvement!' : '📉 Slight dip this week'}
              </span>
            </div>
            <p className="text-sm text-mint-600 mt-1">
              {analytics.weeklyChange > 0 ? '+' : ''}{analytics.weeklyChange}% compared to last week
            </p>
          </div>
        )}

        {/* Today's Activity */}
        {analytics.todayStudyTimeMinutes > 0 && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Today's Progress: {formatTime(analytics.todayStudyTimeMinutes)}
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {analytics.todaySessions} sessions completed today
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

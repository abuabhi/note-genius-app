
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, TrendingUp } from "lucide-react";
import { useTimezoneAwareAnalytics } from "@/hooks/useTimezoneAwareAnalytics";

export const ConsistencyScore = () => {
  const { analytics, isLoading, timezone } = useTimezoneAwareAnalytics();

  // Calculate week display info using proper date calculations
  const getWeekInfo = () => {
    if (!timezone) return { current: '', previous: '' };
    
    try {
      const today = new Date();
      
      // Get today's date in the user's timezone
      const todayInTimezone = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(today);
      
      const [year, month, day] = todayInTimezone.split('-').map(Number);
      const todayDate = new Date(year, month - 1, day);
      
      const formatter = new Intl.DateTimeFormat('en-AU', {
        month: 'short',
        day: 'numeric'
      });
      
      // Current week (Monday to Sunday)
      const dayOfWeek = todayDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      const thisWeekMonday = new Date(todayDate);
      thisWeekMonday.setDate(todayDate.getDate() - daysToMonday);
      
      const thisWeekSunday = new Date(thisWeekMonday);
      thisWeekSunday.setDate(thisWeekMonday.getDate() + 6);
      
      // Previous week (Monday to Sunday)
      const lastWeekMonday = new Date(thisWeekMonday);
      lastWeekMonday.setDate(thisWeekMonday.getDate() - 7);
      
      const lastWeekSunday = new Date(lastWeekMonday);
      lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);
      
      console.log('Week calculations:', {
        today: todayDate,
        thisWeekMonday,
        thisWeekSunday,
        lastWeekMonday,
        lastWeekSunday
      });
      
      return {
        current: `${formatter.format(thisWeekMonday)} - ${formatter.format(thisWeekSunday)}`,
        previous: `${formatter.format(lastWeekMonday)} - ${formatter.format(lastWeekSunday)}`
      };
    } catch (error) {
      console.error('Error calculating week info:', error);
      return { current: 'Week calculation error', previous: 'Week calculation error' };
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Study Consistency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weekInfo = getWeekInfo();
  const consistencyPercentage = Math.min(100, Math.round((analytics.weeklyStudyTimeMinutes / analytics.weeklyGoalMinutes) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Study Consistency Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Week Information */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Week Boundaries ({timezone})</span>
          </div>
          <div className="text-sm text-purple-700 space-y-1">
            <div>This week: {weekInfo.current}</div>
            <div>Last week: {weekInfo.previous}</div>
          </div>
        </div>

        {/* Current Week Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">This Week's Progress</span>
            <span className="text-sm text-gray-600">
              {formatTime(analytics.weeklyStudyTimeMinutes)} / {formatTime(analytics.weeklyGoalMinutes)}
            </span>
          </div>
          <Progress value={consistencyPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{consistencyPercentage}% of weekly goal</span>
            <span>{analytics.weeklySessions} sessions</span>
          </div>
        </div>

        {/* Week-over-Week Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Weekly Comparison</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-800">
                {formatTime(analytics.weeklyStudyTimeMinutes)}
              </div>
              <div className="text-xs text-gray-600">This Week</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold text-gray-800">
                {formatTime(analytics.previousWeekTimeMinutes)}
              </div>
              <div className="text-xs text-gray-600">Last Week</div>
            </div>
          </div>
          
          {analytics.weeklyChange !== 0 && (
            <div className="text-center p-3 rounded-lg border">
              <div className={`text-lg font-bold ${analytics.weeklyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.weeklyChange > 0 ? '+' : ''}{analytics.weeklyChange}%
              </div>
              <div className="text-xs text-gray-600">Change from last week</div>
            </div>
          )}
        </div>

        {/* Today's Activity */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Today's Activity</span>
          </div>
          <div className="text-sm text-gray-600">
            {analytics.todayStudyTimeMinutes > 0 ? (
              <span>{formatTime(analytics.todayStudyTimeMinutes)} studied today ({analytics.todaySessions} sessions)</span>
            ) : (
              <span>No study time recorded today</span>
            )}
          </div>
        </div>

        {/* Debug Info for Development */}
        {timezone && (timezone.includes('Melbourne') || timezone.includes('Australia')) && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs">
            <div className="font-medium text-yellow-800 mb-1">Debug Info (Melbourne timezone)</div>
            <div className="text-yellow-700 space-y-1">
              <div>Total sessions: {analytics.totalSessions}</div>
              <div>Weekly minutes: {analytics.weeklyStudyTimeMinutes}</div>
              <div>Today minutes: {analytics.todayStudyTimeMinutes}</div>
              <div>Timezone: {timezone}</div>
              <div>Today string: {analytics.todayString}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

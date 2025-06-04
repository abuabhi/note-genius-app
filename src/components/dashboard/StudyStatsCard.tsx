
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Target, TrendingUp } from "lucide-react";
import { useStudySessions } from "@/hooks/useStudySessions";
import { formatDuration } from "@/utils/formatTime";

export const StudyStatsCard = () => {
  const { sessions, isLoading, getSessionStatistics } = useStudySessions();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Study Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getSessionStatistics();
  const recentSessions = sessions?.slice(0, 3) || [];
  
  // Calculate today's study time
  const today = new Date().toDateString();
  const todaySessions = sessions?.filter(s => 
    s.start_time && new Date(s.start_time).toDateString() === today
  ) || [];
  const todayMinutes = todaySessions.reduce((total, session) => 
    total + (session.duration ? Math.round(session.duration / 60) : 0), 0
  );

  // Calculate weekly goal progress (assume 5 hours per week goal)
  const weeklyGoalMinutes = 5 * 60; // 5 hours
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekSessions = sessions?.filter(s => 
    s.start_time && new Date(s.start_time) >= weekStart
  ) || [];
  const weeklyMinutes = weekSessions.reduce((total, session) => 
    total + (session.duration ? Math.round(session.duration / 60) : 0), 0
  );
  const weeklyProgress = Math.min(100, (weeklyMinutes / weeklyGoalMinutes) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-mint-600" />
          Study Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-mint-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-mint-600" />
              <span className="text-sm font-medium text-mint-700">Today</span>
            </div>
            <div className="text-2xl font-bold text-mint-900">
              {Math.round(todayMinutes)}m
            </div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Sessions</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.totalSessions}
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
            <span className="text-sm text-gray-600">
              {Math.round(weeklyMinutes)}m / {weeklyGoalMinutes}m
            </span>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
          <p className="text-xs text-gray-500">
            {Math.round(weeklyProgress)}% of weekly goal completed
          </p>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Recent Sessions
            </h4>
            <div className="space-y-2">
              {recentSessions.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.title}</p>
                    {session.subject && (
                      <p className="text-xs text-gray-500">{session.subject}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {session.duration && (
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(session.duration)}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {session.start_time && new Date(session.start_time).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.totalHours}h
              </div>
              <div className="text-xs text-gray-500">Total Study Time</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.averageDuration}m
              </div>
              <div className="text-xs text-gray-500">Avg Session</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

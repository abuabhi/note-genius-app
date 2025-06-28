import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUnifiedSubjectAnalytics } from "@/hooks/useUnifiedSubjectAnalytics";
import { Clock, Calendar, Trophy, TrendingUp, BookOpen, Timer, CalendarDays } from "lucide-react";

const EnhancedSubjectProgressDashboard = memo(() => {
  const { enhancedAnalytics, isLoading } = useUnifiedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    const wholeHours = Math.floor(hours);
    const remainingMinutes = Math.round((hours - wholeHours) * 60);
    return remainingMinutes > 0 ? `${wholeHours}h ${remainingMinutes}m` : `${wholeHours}h`;
  };

  const MetricCard = memo(({ title, value, icon: Icon, color = "gray", trend }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: string;
    trend?: string;
  }) => (
    <Card className={`bg-white border-${color}-200 hover:shadow-sm transition-shadow`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium text-${color}-600 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {title}
          </div>
          {trend && (
            <span className="text-xs text-gray-500">{trend}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`text-2xl font-bold text-${color}-900`}>
          {value}
        </div>
      </CardContent>
    </Card>
  ));

  const SubjectCard = memo(({ subject }: { subject: any }) => (
    <Card className="bg-white border-gray-200 hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">{subject.subject_name}</h3>
          <span className="text-sm text-gray-600">
            {subject.completion_percentage}%
          </span>
        </div>
        <div className="mb-2">
          <Progress 
            value={subject.completion_percentage} 
            className="h-2"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatTime(subject.total_study_minutes / 60)} studied</span>
          <span>{subject.study_sessions_count} sessions</span>
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Learning Analytics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Learning Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Study Time Metrics - 3 cards in 2 columns */}
            <div className="col-span-2 grid grid-cols-3 gap-3">
              <MetricCard
                title="Total Study Time"
                value={formatTime(enhancedAnalytics.totalStudyTime)}
                icon={Clock}
                color="blue"
                trend="All time"
              />
              <MetricCard
                title="Last 30 Days"
                value={formatTime(enhancedAnalytics.thirtyDayStudyTime)}
                icon={CalendarDays}
                color="green"
                trend="Monthly"
              />
              <MetricCard
                title="Last 7 Days"
                value={formatTime(enhancedAnalytics.sevenDayStudyTime)}
                icon={Timer}
                color="purple"
                trend="Weekly"
              />
            </div>
            
            {/* Other Metrics */}
            <MetricCard
              title="Sessions This Week"
              value={enhancedAnalytics.sessionsThisWeek}
              icon={Calendar}
              color="indigo"
            />
            <MetricCard
              title="Average Score"
              value={`${Math.round(enhancedAnalytics.averageScore)}%`}
              icon={Trophy}
              color="yellow"
            />
            <MetricCard
              title="Longest Streak"
              value={`${enhancedAnalytics.longestStreak} days`}
              icon={TrendingUp}
              color="green"
            />
          </div>
        </div>

        {/* Right Panel - Subject Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Subject Progress</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {enhancedAnalytics.subjects.length === 0 ? (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Yet</h3>
                  <p className="text-gray-600 text-center">
                    Create flashcard sets or take quizzes to see your subject progress here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              enhancedAnalytics.subjects.map((subject) => (
                <SubjectCard key={subject.subject_id || subject.subject_name} subject={subject} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Subject Details Summary */}
      {enhancedAnalytics.subjects.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {enhancedAnalytics.subjects.filter(s => s.completion_percentage >= 85).length}
                </div>
                <div className="text-sm text-gray-600">Excelling (85%+)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {enhancedAnalytics.subjects.filter(s => s.completion_percentage >= 60 && s.completion_percentage < 85).length}
                </div>
                <div className="text-sm text-gray-600">Progressing (60-84%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {enhancedAnalytics.subjects.filter(s => s.completion_percentage < 60).length}
                </div>
                <div className="text-sm text-gray-600">Needs Attention (&lt;60%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Time Comparison */}
      {enhancedAnalytics.totalStudyTime > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Study Time Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Weekly Average</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatTime(enhancedAnalytics.sevenDayStudyTime)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Monthly Average</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatTime(enhancedAnalytics.thirtyDayStudyTime / 4.3)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Daily Average (7d)</div>
                  <div className="text-lg font-semibold text-purple-600">
                    {formatTime(enhancedAnalytics.sevenDayStudyTime / 7)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

EnhancedSubjectProgressDashboard.displayName = 'EnhancedSubjectProgressDashboard';

export { EnhancedSubjectProgressDashboard };

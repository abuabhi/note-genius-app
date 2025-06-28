
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSaaSOptimizedSubjectAnalytics } from "@/hooks/useSaaSOptimizedSubjectAnalytics";
import { Clock, Calendar, Trophy, TrendingUp, BookOpen, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EnhancedSubjectProgressDashboard = memo(() => {
  const { subjectAnalytics, isLoading, error } = useSaaSOptimizedSubjectAnalytics();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load analytics data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
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
    const minutes = Math.round((hours % 1) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  };

  const MetricCard = memo(({ title, value, icon: Icon, color = "gray" }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: string;
  }) => (
    <Card className={`bg-white border-${color}-200 hover:shadow-sm transition-shadow`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium text-${color}-600 flex items-center gap-2`}>
          <Icon className="h-4 w-4" />
          {title}
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
          <h3 className="font-medium text-gray-900">{subject.name}</h3>
          <span className="text-sm text-gray-600">
            {subject.completionPercentage}%
          </span>
        </div>
        <div className="mb-2">
          <Progress 
            value={subject.completionPercentage} 
            className="h-2"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatTime(subject.totalStudyTimeMinutes / 60)} studied</span>
          <span>{subject.sessionCount} sessions</span>
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
            <MetricCard
              title="Total Study Time"
              value={formatTime(subjectAnalytics.totalStudyTime)}
              icon={Clock}
              color="blue"
            />
            <MetricCard
              title="Sessions This Week"
              value={subjectAnalytics.sessionsThisWeek}
              icon={Calendar}
              color="green"
            />
            <MetricCard
              title="Average Score"
              value={`${subjectAnalytics.averageScore}%`}
              icon={Trophy}
              color="yellow"
            />
            <MetricCard
              title="Longest Streak"
              value={`${subjectAnalytics.longestStreak} days`}
              icon={TrendingUp}
              color="purple"
            />
          </div>
          
          {/* Additional metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Last 7 Days"
              value={`${subjectAnalytics.last7Days} sessions`}
              icon={Calendar}
              color="mint"
            />
            <MetricCard
              title="Last 30 Days"
              value={`${subjectAnalytics.last30Days} sessions`}
              icon={Calendar}
              color="indigo"
            />
          </div>
        </div>

        {/* Right Panel - Subject Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Subject Progress</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {subjectAnalytics.subjects.length === 0 ? (
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
              subjectAnalytics.subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Subject Details Summary */}
      {subjectAnalytics.subjects.length > 0 && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {subjectAnalytics.subjects.filter(s => s.completionPercentage >= 85).length}
                </div>
                <div className="text-sm text-gray-600">Excelling (85%+)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {subjectAnalytics.subjects.filter(s => s.completionPercentage >= 60 && s.completionPercentage < 85).length}
                </div>
                <div className="text-sm text-gray-600">Progressing (60-84%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {subjectAnalytics.subjects.filter(s => s.completionPercentage < 60).length}
                </div>
                <div className="text-sm text-gray-600">Needs Attention (&lt;60%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Summary */}
      <Card className="bg-gradient-to-r from-mint-50 to-blue-50 border-mint-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-mint-900">Weekly Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-mint-700">{subjectAnalytics.weeklyAverage}</div>
              <div className="text-sm text-mint-600">Avg Sessions/Week</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-700">{formatTime(subjectAnalytics.monthlyAverage)}</div>
              <div className="text-sm text-blue-600">Avg Study Time/Week</div>
            </div>
            <div>
              <div className="text-xl font-bold text-purple-700">{subjectAnalytics.last7Days}</div>
              <div className="text-sm text-purple-600">Sessions (7 days)</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-700">{subjectAnalytics.last30Days}</div>
              <div className="text-sm text-green-600">Sessions (30 days)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

EnhancedSubjectProgressDashboard.displayName = 'EnhancedSubjectProgressDashboard';

export { EnhancedSubjectProgressDashboard };

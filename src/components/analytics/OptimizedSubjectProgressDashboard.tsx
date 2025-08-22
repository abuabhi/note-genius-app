import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSaaSOptimizedSubjectAnalytics } from "@/hooks/useSaaSOptimizedSubjectAnalytics";
import { Clock, Calendar, Trophy, TrendingUp, BookOpen } from "lucide-react";
import { getStudyStatusMessage } from "@/utils/subjectStandardization";

const OptimizedSubjectProgressDashboard = memo(() => {
  const { subjectAnalytics, isLoading } = useSaaSOptimizedSubjectAnalytics();

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

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const MetricCard = memo(({ title, value, icon: Icon, color = "gray" }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: string;
  }) => (
    <Card className={`bg-white border-${color}-200`}>
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

  const SubjectCard = memo(({ subject }: { subject: any }) => {
    const studyStatus = getStudyStatusMessage(subject);
    
    return (
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
            {studyStatus.hasActivity ? (
              <>
                <span>{formatTime(subject.totalStudyTimeMinutes)} studied</span>
                <span>{subject.sessionCount} sessions</span>
              </>
            ) : (
              <span className="text-xs text-amber-600 italic">{studyStatus.message}</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Learning Analytics */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Learning Analytics</h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Total Study Time"
              value={formatTime(Math.round(subjectAnalytics.totalStudyTime * 60))}
              icon={Clock}
            />
            <MetricCard
              title="Sessions This Week"
              value={subjectAnalytics.sessionsThisWeek}
              icon={Calendar}
            />
            <MetricCard
              title="Last 7 Days"
              value={subjectAnalytics.last7DaysFormatted || "No data"}
              icon={Trophy}
            />
            <MetricCard
              title="Last 30 Days"
              value={subjectAnalytics.last30DaysFormatted || "No data"}
              icon={TrendingUp}
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
    </div>
  );
});

OptimizedSubjectProgressDashboard.displayName = 'OptimizedSubjectProgressDashboard';

export { OptimizedSubjectProgressDashboard };

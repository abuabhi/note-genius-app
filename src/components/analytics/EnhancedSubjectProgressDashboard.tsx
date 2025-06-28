
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUnifiedSubjectAnalytics } from "@/hooks/useUnifiedSubjectAnalytics";
import { Clock, Calendar, Trophy, TrendingUp, BookOpen, Target, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";

const EnhancedSubjectProgressDashboard = memo(() => {
  const { subjectAnalytics, isLoading } = useUnifiedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getSubjectColor = (percentage: number) => {
    if (percentage >= 85) return 'border-green-200 bg-gradient-to-br from-green-50 to-green-100';
    if (percentage >= 60) return 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100';
    return 'border-red-200 bg-gradient-to-br from-red-50 to-red-100';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const MetricCard = memo(({ title, value, icon: Icon, description }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    description?: string;
  }) => (
    <Card className="bg-white border-mint-200 hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-mint-100 rounded-lg">
            <Icon className="h-5 w-5 text-mint-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-mint-600">{title}</p>
            <p className="text-2xl font-bold text-mint-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  const SubjectCard = memo(({ subject }: { subject: any }) => (
    <Card className={`transition-all duration-200 hover:shadow-md ${getSubjectColor(subject.completionPercentage)}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 truncate">{subject.name}</h3>
            <Badge variant="outline" className="text-xs font-medium">
              {subject.completionPercentage}%
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress 
              value={subject.completionPercentage} 
              className="h-2"
              style={{
                '--progress-background': getProgressColor(subject.completionPercentage)
              } as React.CSSProperties}
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{formatTime(subject.totalStudyTimeMinutes)}</p>
              <p className="text-xs text-gray-600">Study Time</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{subject.sessionCount}</p>
              <p className="text-xs text-gray-600">Sessions</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{subject.flashcardMastery}%</p>
              <p className="text-xs text-gray-500">Cards</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{subject.averageScore}%</p>
              <p className="text-xs text-gray-500">Quizzes</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{subject.studyConsistency}%</p>
              <p className="text-xs text-gray-500">Consistency</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  const RecommendationCard = memo(({ recommendation }: { recommendation: any }) => (
    <Card className="bg-white border-mint-200 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-mint-100 rounded-lg text-mint-600">
            <Lightbulb className="h-4 w-4" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={getPriorityColor(recommendation.priority)}>
                {recommendation.priority.toUpperCase()}
              </Badge>
              {recommendation.subject && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {recommendation.subject}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-800 font-medium">
              {recommendation.message}
            </p>
            
            {recommendation.actionItems?.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Action Items:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {recommendation.actionItems.slice(0, 2).map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 text-mint-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="space-y-8">
      {/* Top Section - Key Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Study Time"
            value={formatTime(Math.round(subjectAnalytics.totalStudyTime * 60))}
            icon={Clock}
            description="All time"
          />
          <MetricCard
            title="Last 30 Days"
            value={formatTime(Math.round(subjectAnalytics.thirtyDayStudyTime * 60))}
            icon={Calendar}
            description="Recent activity"
          />
          <MetricCard
            title="Last 7 Days"
            value={formatTime(Math.round(subjectAnalytics.sevenDayStudyTime * 60))}
            icon={TrendingUp}
            description="This week"
          />
        </div>
      </div>

      {/* Middle Section - Subject Progress Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Subject Progress</h2>
          <span className="text-sm text-gray-500">
            {subjectAnalytics.subjects.length} subject{subjectAnalytics.subjects.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {subjectAnalytics.subjects.length === 0 ? (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Yet</h3>
              <p className="text-gray-600 text-center max-w-md">
                Create flashcard sets or take quizzes to see your subject progress here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subjectAnalytics.subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>

      {/* Subject Performance Summary */}
      {subjectAnalytics.subjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-800">
                  {subjectAnalytics.subjects.filter(s => s.completionPercentage >= 85).length}
                </div>
                <div className="text-sm text-green-700">Excelling (85%+)</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-800">
                  {subjectAnalytics.subjects.filter(s => s.completionPercentage >= 60 && s.completionPercentage < 85).length}
                </div>
                <div className="text-sm text-yellow-700">Progressing (60-84%)</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-800">
                  {subjectAnalytics.subjects.filter(s => s.completionPercentage < 60).length}
                </div>
                <div className="text-sm text-red-700">Needs Attention (&lt;60%)</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Bottom Section - Study Recommendations */}
      {subjectAnalytics.recommendations && subjectAnalytics.recommendations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-mint-600" />
            Study Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectAnalytics.recommendations.slice(0, 4).map((recommendation, index) => (
              <RecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

EnhancedSubjectProgressDashboard.displayName = 'EnhancedSubjectProgressDashboard';

export { EnhancedSubjectProgressDashboard };

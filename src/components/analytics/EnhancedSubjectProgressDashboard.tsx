
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUnifiedSubjectAnalytics } from "@/hooks/useUnifiedSubjectAnalytics";
import { Clock, Calendar, Trophy, TrendingUp, BookOpen, AlertCircle, CheckCircle, Target, Brain } from "lucide-react";

const EnhancedSubjectProgressDashboard = memo(() => {
  const { enhancedAnalytics, isLoading } = useUnifiedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading skeleton */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
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

  const getSubjectColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSubjectBorderColor = (percentage: number) => {
    if (percentage >= 85) return "border-green-200";
    if (percentage >= 60) return "border-yellow-200";
    return "border-red-200";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const MetricCard = memo(({ title, value, icon: Icon, description, color = "mint" }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    description?: string;
    color?: string;
  }) => (
    <Card className={`bg-gradient-to-br from-${color}-50 to-white border-${color}-200 hover:shadow-lg transition-all`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`h-6 w-6 text-${color}-600`} />
          <div className={`text-2xl font-bold text-${color}-900`}>
            {value}
          </div>
        </div>
        <h3 className={`font-medium text-${color}-800 mb-1`}>{title}</h3>
        {description && (
          <p className={`text-sm text-${color}-600`}>{description}</p>
        )}
      </CardContent>
    </Card>
  ));

  const SubjectCard = memo(({ subject }: { subject: any }) => (
    <Card className={`hover:shadow-lg transition-all ${getSubjectBorderColor(subject.completionPercentage)} border-2`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 truncate">{subject.name}</h3>
          <Badge variant="outline" className={getSubjectColor(subject.completionPercentage)}>
            {subject.completionPercentage}%
          </Badge>
        </div>
        
        <div className="mb-4">
          <Progress 
            value={subject.completionPercentage} 
            className="h-3"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{formatTime(subject.totalStudyTimeMinutes)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{subject.sessionCount} sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{subject.flashcardMastery}% mastery</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{subject.averageScore}% avg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  const RecommendationCard = memo(({ recommendation }: { recommendation: any }) => (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900">{recommendation.subject_name}</h4>
          <Badge className={getPriorityColor(recommendation.priority)}>
            {recommendation.priority}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-3">{recommendation.message}</p>
        {recommendation.action_items && recommendation.action_items.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Action Items:</span>
            <ul className="text-xs text-gray-600 space-y-1">
              {recommendation.action_items.map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-1 w-1 bg-blue-500 rounded-full"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  ));

  return (
    <div className="space-y-8">
      {/* Key Metrics Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Study Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Study Time"
            value={formatTime(enhancedAnalytics.totalStudyTimeMinutes)}
            icon={Clock}
            description="All time across subjects"
            color="blue"
          />
          <MetricCard
            title="Last 30 Days"
            value={formatTime(enhancedAnalytics.last30DaysMinutes)}
            icon={Calendar}
            description="Recent study activity"
            color="green"
          />
          <MetricCard
            title="Last 7 Days"
            value={formatTime(enhancedAnalytics.last7DaysMinutes)}
            icon={TrendingUp}
            description="This week's progress"
            color="purple"
          />
        </div>
      </div>

      {/* Subject Progress Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Subject Progress</h2>
          <div className="text-sm text-gray-500">
            {enhancedAnalytics.subjects.length} subjects tracked
          </div>
        </div>
        
        {enhancedAnalytics.subjects.length === 0 ? (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Subjects Yet</h3>
              <p className="text-gray-600 text-center max-w-md">
                Create flashcard sets, take quizzes, or start study sessions to see your subject progress here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enhancedAnalytics.subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>

      {/* Study Recommendations Section */}
      {enhancedAnalytics.recommendations && enhancedAnalytics.recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Study Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enhancedAnalytics.recommendations.map((recommendation, index) => (
              <RecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        </div>
      )}

      {/* Study Insights Section */}
      {enhancedAnalytics.subjects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Study Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-mint-50 to-white border-mint-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-800 mb-1">
                  {enhancedAnalytics.subjects.filter(s => s.completionPercentage >= 85).length}
                </div>
                <p className="text-sm text-green-600">Excelling (85%+)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-yellow-800 mb-1">
                  {enhancedAnalytics.subjects.filter(s => s.completionPercentage >= 60 && s.completionPercentage < 85).length}
                </div>
                <p className="text-sm text-yellow-600">Progressing (60-84%)</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-red-800 mb-1">
                  {enhancedAnalytics.subjects.filter(s => s.completionPercentage < 60).length}
                </div>
                <p className="text-sm text-red-600">Needs Attention (&lt;60%)</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Study Time Averages */}
      {enhancedAnalytics.subjects.length > 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              Study Time Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-800">
                  {formatTime(Math.round(enhancedAnalytics.totalStudyTimeMinutes / Math.max(enhancedAnalytics.subjects.length, 1)))}
                </div>
                <p className="text-sm text-indigo-600">Avg per Subject</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-800">
                  {formatTime(Math.round(enhancedAnalytics.last30DaysMinutes / 30))}
                </div>
                <p className="text-sm text-indigo-600">Daily Average (30d)</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-800">
                  {formatTime(Math.round(enhancedAnalytics.last7DaysMinutes / 7))}
                </div>
                <p className="text-sm text-indigo-600">Daily Average (7d)</p>
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

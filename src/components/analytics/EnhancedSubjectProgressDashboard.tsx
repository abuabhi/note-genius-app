
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useUnifiedSubjectAnalytics } from "@/hooks/useUnifiedSubjectAnalytics";
import { Clock, Calendar, Trophy, TrendingUp, BookOpen, Brain, Target, AlertCircle, CheckCircle, Zap } from "lucide-react";

const EnhancedSubjectProgressDashboard = memo(() => {
  const { subjectAnalytics, isLoading } = useUnifiedSubjectAnalytics();

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

  const MetricCard = memo(({ title, value, icon: Icon, color = "mint", trend }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: string;
    trend?: string;
  }) => (
    <Card className={`bg-white border-${color}-200 hover:shadow-sm transition-shadow`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium text-${color}-600 flex items-center gap-2`}>
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`text-2xl font-bold text-${color}-900 mb-1`}>
          {value}
        </div>
        {trend && (
          <p className="text-xs text-gray-500">{trend}</p>
        )}
      </CardContent>
    </Card>
  ));

  const SubjectCard = memo(({ subject }: { subject: any }) => (
    <Card className={`bg-white transition-all hover:shadow-md border-l-4 ${
      subject.color === 'green' 
        ? 'border-l-green-500 border-green-200' 
        : subject.color === 'yellow' 
        ? 'border-l-yellow-500 border-yellow-200' 
        : 'border-l-red-500 border-red-200'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">{subject.subject_name}</h3>
            <Badge className={`text-xs ${
              subject.color === 'green' 
                ? 'bg-green-100 text-green-800' 
                : subject.color === 'yellow' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {subject.completion_percentage}%
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-600">
              {subject.learning_velocity} c/h
            </span>
          </div>
        </div>
        
        <Progress 
          value={subject.completion_percentage} 
          className={`h-2 mb-3 ${
            subject.color === 'green' ? '[&>div]:bg-green-500' : 
            subject.color === 'yellow' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
          }`}
        />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-600">
              <Brain className="h-3 w-3" />
              <span>{subject.total_flashcards} cards</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Target className="h-3 w-3" />
              <span>{subject.mastered_flashcards} mastered</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{formatTime(subject.total_study_minutes)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <BookOpen className="h-3 w-3" />
              <span>{subject.notes_count} notes</span>
            </div>
          </div>
        </div>

        {subject.flashcard_accuracy > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Accuracy</span>
              <span className={`font-medium ${
                subject.flashcard_accuracy >= 80 ? 'text-green-600' :
                subject.flashcard_accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {subject.flashcard_accuracy}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  ));

  const RecommendationCard = memo(({ recommendation }: { recommendation: any }) => (
    <Card className={`border-l-4 ${
      recommendation.priority === 'high' ? 'border-l-red-500 border-red-200' :
      recommendation.priority === 'medium' ? 'border-l-yellow-500 border-yellow-200' :
      'border-l-blue-500 border-blue-200'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {recommendation.priority === 'high' ? (
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          ) : recommendation.priority === 'medium' ? (
            <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
          ) : (
            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{recommendation.subject_name}</h4>
              <Badge className={`text-xs ${
                recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {recommendation.priority}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{recommendation.message}</p>
            <div className="space-y-1">
              {recommendation.action_items.map((action: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="space-y-8">
      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Study Time"
          value={formatTime(Math.round(subjectAnalytics.totalStudyTime * 60))}
          icon={Clock}
          color="mint"
        />
        <MetricCard
          title="Weekly Sessions"
          value={subjectAnalytics.sessionsThisWeek}
          icon={Calendar}
          color="blue"
        />
        <MetricCard
          title="Average Score"
          value={`${subjectAnalytics.averageScore}%`}
          icon={Trophy}
          color="yellow"
        />
        <MetricCard
          title="Study Streak"
          value={`${subjectAnalytics.longestStreak} days`}
          icon={TrendingUp}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Subject Progress */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Subject Progress</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Excelling</span>
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span>Progress</span>
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Needs Attention</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {subjectAnalytics.subjects.length === 0 ? (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Subject Data</h3>
                  <p className="text-gray-600 text-center">
                    Create flashcard sets, take quizzes, or add notes to see your subject progress.
                  </p>
                </CardContent>
              </Card>
            ) : (
              subjectAnalytics.subjects.map((subject) => (
                <SubjectCard key={`${subject.subject_name}-${subject.subject_id}`} subject={subject} />
              ))
            )}
          </div>
        </div>

        {/* Smart Recommendations */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Smart Recommendations</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {subjectAnalytics.recommendations.length === 0 ? (
              <Card className="bg-mint-50 border-mint-200">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-8 w-8 text-mint-500 mb-3" />
                  <h3 className="font-medium text-mint-900 mb-1">All Good!</h3>
                  <p className="text-sm text-mint-600 text-center">
                    No immediate recommendations. Keep up the great work!
                  </p>
                </CardContent>
              </Card>
            ) : (
              subjectAnalytics.recommendations.map((recommendation, index) => (
                <RecommendationCard key={`${recommendation.subject_name}-${index}`} recommendation={recommendation} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Subject Summary Stats */}
      {subjectAnalytics.subjects.length > 0 && (
        <Card className="bg-gradient-to-r from-mint-50 to-blue-50 border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mint-900">Subject Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {subjectAnalytics.subjects.filter(s => s.color === 'green').length}
                </div>
                <div className="text-sm text-gray-600">Excelling (85%+)</div>
                <div className="text-xs text-gray-500 mt-1">High Performance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {subjectAnalytics.subjects.filter(s => s.color === 'yellow').length}
                </div>
                <div className="text-sm text-gray-600">Progressing (60-84%)</div>
                <div className="text-xs text-gray-500 mt-1">Good Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {subjectAnalytics.subjects.filter(s => s.color === 'red').length}
                </div>
                <div className="text-sm text-gray-600">Needs Attention (&lt;60%)</div>
                <div className="text-xs text-gray-500 mt-1">Focus Required</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {Math.round(subjectAnalytics.subjects.reduce((sum, s) => sum + s.learning_velocity, 0) / Math.max(subjectAnalytics.subjects.length, 1) * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">Avg. Velocity</div>
                <div className="text-xs text-gray-500 mt-1">Cards/Hour</div>
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

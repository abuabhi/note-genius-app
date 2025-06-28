import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, BookOpen, Award, Users, Zap } from 'lucide-react';
import { useOptimizedSubjectAnalytics } from '@/hooks/useOptimizedSubjectAnalytics';

export const EnhancedSubjectProgressDashboard = () => {
  const { subjectAnalytics: enhancedAnalytics, isLoading } = useOptimizedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-mint-50 h-32 rounded-lg border border-mint-200"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-mint-50 h-48 rounded-lg border border-mint-200"></div>
          ))}
        </div>
      </div>
    );
  }

  // Key metrics section
  const keyMetrics = [
    {
      label: 'Total Study Time',
      value: `${Math.floor(enhancedAnalytics.totalStudyTime)} hrs`,
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      label: 'Weekly Sessions',
      value: enhancedAnalytics.sessionsThisWeek,
      icon: Target,
      color: 'text-green-600'
    },
    {
      label: 'Average Score',
      value: `${Math.round(enhancedAnalytics.averageScore)}%`,
      icon: Award,
      color: 'text-orange-600'
    },
    {
      label: 'Learning Streak',
      value: `${enhancedAnalytics.longestStreak} days`,
      icon: Zap,
      color: 'text-purple-600'
    }
  ];

  // Subject recommendations based on completion percentage
  const getRecommendations = (subjects: typeof enhancedAnalytics.subjects) => {
    const recommendations = [];
    
    const lowPerformance = subjects.filter(s => s.completion_percentage < 40);
    const mediumPerformance = subjects.filter(s => s.completion_percentage >= 40 && s.completion_percentage < 70);
    const highPerformance = subjects.filter(s => s.completion_percentage >= 70);

    if (lowPerformance.length > 0) {
      recommendations.push({
        type: 'focus',
        title: 'Needs Attention',
        subjects: lowPerformance.slice(0, 2),
        suggestion: 'These subjects need more focused study time'
      });
    }

    if (mediumPerformance.length > 0) {
      recommendations.push({
        type: 'improve',
        title: 'Good Progress',
        subjects: mediumPerformance.slice(0, 2),
        suggestion: 'Continue building momentum in these areas'
      });
    }

    if (highPerformance.length > 0) {
      recommendations.push({
        type: 'maintain',
        title: 'Excelling',
        subjects: highPerformance.slice(0, 2),
        suggestion: 'Maintain your excellent progress'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations(enhancedAnalytics.subjects);

  return (
    <div className="space-y-8">
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index} className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-gray-50 ${metric.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subject Progress Grid */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subject Performance
          </CardTitle>
          <p className="text-gray-600">Track your progress across all subjects</p>
        </CardHeader>
        <CardContent>
          {enhancedAnalytics.subjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No subject data available yet</p>
              <p className="text-sm">Start studying to see your progress here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {enhancedAnalytics.subjects.map((subject, index) => (
                <Card key={index} className="bg-gray-50 border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Subject header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{subject.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${subject.completion_percentage >= 85 ? 'bg-green-50 text-green-700 border-green-200' : ''}
                            ${subject.completion_percentage >= 60 && subject.completion_percentage < 85 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                            ${subject.completion_percentage < 60 ? 'bg-red-50 text-red-700 border-red-200' : ''}
                          `}
                        >
                          {subject.completion_percentage >= 85 ? 'Excellent' : ''}
                          {subject.completion_percentage >= 60 && subject.completion_percentage < 85 ? 'Good' : ''}
                          {subject.completion_percentage < 60 ? 'Needs Focus' : ''}
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{subject.completion_percentage}%</span>
                        </div>
                        <Progress value={subject.completion_percentage} className="h-2" />
                      </div>

                      {/* Subject stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white rounded p-2 border border-gray-100">
                          <div className="text-xs text-gray-500">Study Time</div>
                          <div className="font-medium text-gray-900">{Math.floor(subject.totalStudyTimeMinutes / 60)}h {subject.totalStudyTimeMinutes % 60}m</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-100">
                          <div className="text-xs text-gray-500">Sessions</div>
                          <div className="font-medium text-gray-900">{subject.sessionCount}</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-100">
                          <div className="text-xs text-gray-500">Quiz Avg</div>
                          <div className="font-medium text-gray-900">{subject.averageScore}%</div>
                        </div>
                        <div className="bg-white rounded p-2 border border-gray-100">
                          <div className="text-xs text-gray-500">Mastery</div>
                          <div className="font-medium text-gray-900">{subject.flashcardMastery}%</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
            <p className="text-gray-600">Personalized suggestions to optimize your learning</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {rec.subjects.length} subject{rec.subjects.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.suggestion}</p>
                <div className="flex flex-wrap gap-2">
                  {rec.subjects.map((subject, subIndex) => (
                    <Badge key={subIndex} variant="secondary" className="text-xs">
                      {subject.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOptimizedSubjectAnalytics } from '@/hooks/useOptimizedSubjectAnalytics';
import { BookOpen, Clock, Target, TrendingUp, Trophy, Users, Calendar, BarChart3 } from 'lucide-react';

export const EnhancedSubjectProgressDashboard = () => {
  const { subjectAnalytics: enhancedAnalytics, isLoading } = useOptimizedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getSubjectColorClass = (subject: any) => {
    if (subject.completionPercentage >= 85) return 'border-green-200 bg-green-50';
    if (subject.completionPercentage >= 60 && subject.completionPercentage < 85) return 'border-yellow-200 bg-yellow-50';
    if (subject.completionPercentage < 60) return 'border-red-200 bg-red-50';
    return 'border-gray-200 bg-gray-50';
  };

  const getProgressColorClass = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatHours = (hours: number) => {
    return hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Study Time</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatHours(enhancedAnalytics.totalStudyTime)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Weekly Sessions</p>
                <p className="text-2xl font-bold text-green-900">
                  {enhancedAnalytics.sessionsThisWeek}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Average Score</p>
                <p className="text-2xl font-bold text-purple-900">
                  {Math.round(enhancedAnalytics.averageScore)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Study Streak</p>
                <p className="text-2xl font-bold text-orange-900">
                  {enhancedAnalytics.longestStreak} days
                </p>
              </div>
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Subject Performance Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Excelling (85%+)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">
              {enhancedAnalytics.subjects.filter(s => s.completionPercentage >= 85).length}
            </div>
            <div className="space-y-2">
              {enhancedAnalytics.subjects.filter(s => s.completionPercentage >= 85 && s.completionPercentage < 85).slice(0, 3).map((subject) => (
                <div key={subject.name} className="text-sm text-green-700">
                  {subject.name} ({subject.completionPercentage}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progressing (60-84%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700 mb-2">
              {enhancedAnalytics.subjects.filter(s => s.completionPercentage >= 60 && s.completionPercentage < 85).length}
            </div>
            <div className="space-y-2">
              {enhancedAnalytics.subjects.filter(s => s.completionPercentage >= 60 && s.completionPercentage < 85).slice(0, 3).map((subject) => (
                <div key={subject.name} className="text-sm text-yellow-700">
                  {subject.name} ({subject.completionPercentage}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Needs Attention (&lt;60%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 mb-2">
              {enhancedAnalytics.subjects.filter(s => s.completionPercentage < 60).length}
            </div>
            <div className="space-y-2">
              {enhancedAnalytics.subjects.filter(s => s.completionPercentage < 60).slice(0, 3).map((subject) => (
                <div key={subject.name} className="text-sm text-red-700">
                  {subject.name} ({subject.completionPercentage}%)
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Subject Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Detailed Subject Progress */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Subject Progress Detail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {enhancedAnalytics.subjects.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Yet</h3>
                  <p className="text-gray-600">
                    Create flashcard sets or take quizzes to see your subject progress here.
                  </p>
                </div>
              ) : (
                enhancedAnalytics.subjects.map((subject) => (
                  <Card key={subject.name} className={`${getSubjectColorClass(subject)} transition-all hover:shadow-sm`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                        <Badge 
                          variant={subject.completionPercentage >= 85 ? "default" : subject.completionPercentage >= 60 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {subject.completionPercentage}%
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <Progress 
                          value={subject.completionPercentage} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(subject.totalStudyTimeMinutes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{subject.sessionCount} sessions</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Performance Insights */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Study Time Distribution */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Study Time Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">
                      {formatHours(enhancedAnalytics.totalStudyTime)}
                    </div>
                    <div className="text-sm text-blue-600">Total Time</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {enhancedAnalytics.sessionsThisWeek}
                    </div>
                    <div className="text-sm text-green-600">This Week</div>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              {enhancedAnalytics.subjects.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Top Performing Subjects</h4>
                  <div className="space-y-2">
                    {enhancedAnalytics.subjects
                      .filter(s => s.completionPercentage > 0)
                      .slice(0, 3)
                      .map((subject, index) => (
                        <div key={subject.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="font-medium">{subject.name}</span>
                          </div>
                          <Badge variant="outline">{subject.completionPercentage}%</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200">
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

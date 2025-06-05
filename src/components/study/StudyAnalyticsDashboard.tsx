
import { useEnhancedStudySessions } from '@/hooks/useEnhancedStudySessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, BookOpen, Award, Brain } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const StudyAnalyticsDashboard = () => {
  const { sessions, analytics, getSessionStatistics } = useEnhancedStudySessions();
  const stats = getSessionStatistics;

  // Get recent analytics (last 7 days)
  const recentAnalytics = analytics.slice(0, 7);
  
  // Calculate learning trends
  const weeklyProgress = recentAnalytics.reduce((acc, day) => {
    acc.totalTime += day.total_study_time;
    acc.avgAccuracy += day.flashcard_accuracy;
    acc.avgQuizScore += day.quiz_average_score;
    return acc;
  }, { totalTime: 0, avgAccuracy: 0, avgQuizScore: 0 });

  const avgWeeklyAccuracy = recentAnalytics.length > 0 ? 
    Math.round(weeklyProgress.avgAccuracy / recentAnalytics.length) : 0;
  const avgWeeklyQuizScore = recentAnalytics.length > 0 ? 
    Math.round(weeklyProgress.avgQuizScore / recentAnalytics.length) : 0;

  // Get session quality distribution
  const qualityDistribution = sessions.reduce((acc, session) => {
    acc[session.session_quality] = (acc[session.session_quality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'needs_improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      case 'short': return 'bg-gray-400';
      case 'excessive': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'needs_improvement': return 'Needs Work';
      case 'poor': return 'Poor';
      case 'short': return 'Too Short';
      case 'excessive': return 'Too Long';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mint-100 rounded-lg">
                <Clock className="h-5 w-5 text-mint-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-mint-800">{stats.totalHours}h</div>
                <div className="text-sm text-mint-600">Total Study Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-800">{stats.averageAccuracy}%</div>
                <div className="text-sm text-blue-600">Average Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-800">{stats.totalCardsReviewed}</div>
                <div className="text-sm text-green-600">Cards Reviewed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-800">{stats.totalQuizzesTaken}</div>
                <div className="text-sm text-purple-600">Quizzes Taken</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Quality Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Session Quality Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(qualityDistribution).map(([quality, count]) => (
              <div key={quality} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getQualityColor(quality)}`} />
                  <span className="font-medium">{getQualityLabel(quality)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(count / stats.totalSessions) * 100} 
                    className="w-24 h-2"
                  />
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-800 mb-2">
                {Math.round(weeklyProgress.totalTime / 60)}h
              </div>
              <div className="text-sm text-mint-600">Total Study Time (7 days)</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-800 mb-2">
                {avgWeeklyAccuracy}%
              </div>
              <div className="text-sm text-blue-600">Average Flashcard Accuracy</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800 mb-2">
                {avgWeeklyQuizScore}%
              </div>
              <div className="text-sm text-green-600">Average Quiz Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Daily Analytics */}
      {recentAnalytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Daily Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnalytics.map((day) => (
                <div key={day.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">
                      {format(parseISO(day.date), 'MMM dd')}
                    </div>
                    <Badge variant="outline">
                      {Math.round(day.total_study_time / 60)}min
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{day.flashcard_accuracy}%</div>
                      <div className="text-xs text-gray-500">Flashcards</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{day.quiz_average_score}%</div>
                      <div className="text-xs text-gray-500">Quizzes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{day.subjects_studied.length}</div>
                      <div className="text-xs text-gray-500">Subjects</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

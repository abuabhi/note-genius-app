
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEnhancedSubjectAnalytics } from "@/hooks/useEnhancedSubjectAnalytics";
import { 
  Clock, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  BookOpen, 
  Target,
  BarChart3,
  Timer,
  Award,
  Plus,
  Lightbulb,
  Users,
  Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const EnhancedSubjectProgressDashboard = memo(() => {
  const { analyticsData, isLoading } = useEnhancedSubjectAnalytics();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
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

  const createSubject = (subjectName: string) => {
    // Navigate to create flashcard set with pre-filled subject
    navigate(`/flashcards/create?subject=${encodeURIComponent(subjectName)}`);
  };

  return (
    <div className="space-y-8">
      {/* Time Period Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Time Period Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-mint-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-mint-600 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Total Study Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-mint-900">
                {formatTime(analyticsData.totalStudyTimeMinutes)}
              </div>
              <p className="text-xs text-mint-600">
                {analyticsData.totalStudyTimeHours}h total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Last 7 Days
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-blue-900">
                {formatTime(analyticsData.last7DaysMinutes)}
              </div>
              <p className="text-xs text-blue-600">
                Recent activity
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-purple-900">
                {formatTime(analyticsData.last30DaysMinutes)}
              </div>
              <p className="text-xs text-purple-600">
                Monthly total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Sessions This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-green-900">
                {analyticsData.sessionsThisWeek}
              </div>
              <p className="text-xs text-green-600">
                Study sessions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Longest Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-900">
              {analyticsData.longestStreak}
            </div>
            <p className="text-xs text-orange-600">
              days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Weekly Average
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-indigo-900">
              {formatTime(analyticsData.weeklyAverageMinutes)}
            </div>
            <p className="text-xs text-indigo-600">
              per week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-pink-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-pink-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Average
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-pink-900">
              {formatTime(analyticsData.monthlyAverageMinutes)}
            </div>
            <p className="text-xs text-pink-600">
              per month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-teal-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-600 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Daily Average (7d)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-teal-900">
              {formatTime(analyticsData.dailyAverageMinutes)}
            </div>
            <p className="text-xs text-teal-600">
              per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Study Time Insights */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Study Time Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-mint-800 mb-1">
                {formatTime(analyticsData.weeklyAverageMinutes)}
              </div>
              <p className="text-sm text-mint-700 font-medium">Weekly Average</p>
              <p className="text-xs text-mint-600 mt-1">
                Based on last 4 weeks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-800 mb-1">
                {formatTime(analyticsData.monthlyAverageMinutes)}
              </div>
              <p className="text-sm text-blue-700 font-medium">Monthly Average</p>
              <p className="text-xs text-blue-600 mt-1">
                Last 30 days total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-800 mb-1">
                {formatTime(analyticsData.dailyAverageMinutes)}
              </div>
              <p className="text-sm text-purple-700 font-medium">Daily Average (7d)</p>
              <p className="text-xs text-purple-600 mt-1">
                Recent 7 days
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Subject Progress</h2>
            <Badge variant="outline" className="text-xs">
              {analyticsData.subjects.length} subjects
            </Badge>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {analyticsData.subjects.length === 0 ? (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Yet</h3>
                  <p className="text-gray-600 text-center text-sm">
                    Create flashcard sets or take quizzes to see your subject progress here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              analyticsData.subjects.map((subject) => (
                <Card key={subject.id} className="bg-white border-gray-200 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          subject.color === 'green' ? 'bg-green-500' :
                          subject.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {subject.completionPercentage}%
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <Progress 
                        value={subject.completionPercentage} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Study Time:</span>
                        <br />
                        {formatTime(subject.totalStudyTimeMinutes)}
                      </div>
                      <div>
                        <span className="font-medium">Sessions:</span>
                        <br />
                        {subject.sessionCount}
                      </div>
                      <div>
                        <span className="font-medium">Cards Mastered:</span>
                        <br />
                        {subject.masteredCards}/{subject.totalCards}
                      </div>
                      <div>
                        <span className="font-medium">Avg Score:</span>
                        <br />
                        {subject.averageScore || 0}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Subject Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Subject Suggestions</h2>
            <Lightbulb className="h-5 w-5 text-yellow-500" />
          </div>
          
          <div className="space-y-3">
            {analyticsData.suggestions.length === 0 ? (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Brain className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-medium text-yellow-800 mb-2">Start Learning!</h3>
                  <p className="text-yellow-700 text-sm">
                    Create flashcard sets or take quizzes to get personalized subject suggestions.
                  </p>
                </CardContent>
              </Card>
            ) : (
              analyticsData.suggestions.map((suggestion, index) => (
                <Card key={index} className="bg-white border-gray-200 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{suggestion.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.confidence}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.reason}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        Based on {suggestion.basedOn.join(', ')}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => createSubject(suggestion.name)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Performance Summary</CardTitle>
          <p className="text-sm text-gray-600">Overall subject performance breakdown</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analyticsData.performanceSummary.excelling}
              </div>
              <div className="text-sm font-medium text-green-700 mb-1">Excelling</div>
              <div className="text-xs text-green-600">85%+ completion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {analyticsData.performanceSummary.progressing}
              </div>
              <div className="text-sm font-medium text-yellow-700 mb-1">Progressing</div>
              <div className="text-xs text-yellow-600">60-84% completion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {analyticsData.performanceSummary.needsAttention}
              </div>
              <div className="text-sm font-medium text-red-700 mb-1">Needs Attention</div>
              <div className="text-xs text-red-600">&lt;60% completion</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

EnhancedSubjectProgressDashboard.displayName = 'EnhancedSubjectProgressDashboard';

export { EnhancedSubjectProgressDashboard };

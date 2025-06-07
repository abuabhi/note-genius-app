
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Brain, 
  Target, 
  Calendar,
  TrendingUp, 
  Award,
  BookOpen,
  Activity,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { useConsolidatedAnalytics } from "@/hooks/useConsolidatedAnalytics";

export const LearningAnalyticsDashboard = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "text-green-600 bg-green-50";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getTrendIndicator = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-mint-900">Learning Analytics</h2>
        
        {/* Primary Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Study Time */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Study Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalStudyTime}h</div>
              <div className="flex items-center mt-2 text-sm">
                {getTrendIndicator(analytics.todayStudyTime)}
                <span className="ml-1 text-gray-600">
                  {analytics.todayStudyTime}h today
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cards Mastered */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cards Mastered</CardTitle>
              <Brain className="h-4 w-4 text-mint-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalCardsMastered}</div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  High retention
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Flashcard Accuracy */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Accuracy Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.flashcardAccuracy}%</div>
              <div className="mt-2">
                <Badge className={getAccuracyColor(analytics.flashcardAccuracy)}>
                  {analytics.flashcardAccuracy >= 80 ? 'Excellent' : analytics.flashcardAccuracy >= 60 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Study Sessions */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalSessions}</div>
              <div className="text-sm text-gray-600 mt-2">
                Avg: {analytics.averageSessionTime} min/session
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Study Actions */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Study Actions</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-auto p-4 bg-mint-600 hover:bg-mint-700">
              <Link to="/flashcards" className="flex flex-col items-center gap-2">
                <BookOpen className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Study Flashcards</div>
                  <div className="text-xs opacity-90">Review and learn with spaced repetition</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 border-mint-600 text-mint-700 hover:bg-mint-50">
              <Link to="/quizzes" className="flex flex-col items-center gap-2">
                <Activity className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Take Quiz</div>
                  <div className="text-xs opacity-90">Test your knowledge with timed quizzes</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 border-mint-600 text-mint-700 hover:bg-mint-50">
              <Link to="/notes" className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Review Notes</div>
                  <div className="text-xs opacity-90">Access your study materials</div>
                </div>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

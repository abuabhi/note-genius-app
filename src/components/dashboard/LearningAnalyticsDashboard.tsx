import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Activity,
  FileText,
  BookOpen,
  CheckCircle2,
  Circle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useConsolidatedAnalytics } from "@/hooks/useConsolidatedAnalytics";

export const LearningAnalyticsDashboard = () => {
  const { analytics, isLoading } = useConsolidatedAnalytics();

  console.log('📊 LearningAnalyticsDashboard received analytics:', {
    totalSessions: analytics.totalSessions,
    totalQuizzes: analytics.totalQuizzes,
    completedQuizzes: analytics.completedQuizzes,
    totalNotes: analytics.totalNotes
  });

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

  const getQuizCompletionRate = () => {
    if (analytics.totalQuizzes === 0) return 0;
    return Math.round((analytics.completedQuizzes / analytics.totalQuizzes) * 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-mint-900">Learning Analytics</h2>
        
        {/* Updated Stats Grid - removed Total Study Time, Cards Mastered, Accuracy Rate */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Sessions - unchanged */}
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

          {/* Total Quizzes vs Completed - NEW */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Quiz Progress</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {analytics.completedQuizzes}/{analytics.totalQuizzes}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {getQuizCompletionRate()}% completion rate
              </div>
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: Math.min(analytics.totalQuizzes, 5) }).map((_, i) => (
                  <div key={i}>
                    {i < analytics.completedQuizzes ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Circle className="h-3 w-3 text-gray-300" />
                    )}
                  </div>
                ))}
                {analytics.totalQuizzes > 5 && (
                  <span className="text-xs text-gray-500 ml-1">+{analytics.totalQuizzes - 5}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total Notes - NEW */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-mint-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalNotes}</div>
              <div className="text-sm text-gray-600 mt-2">
                Notes created
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for fourth card or remove this section */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Flashcard Sets</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalSets}</div>
              <div className="text-sm text-gray-600 mt-2">
                Sets created
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

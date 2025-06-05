
import { useUnifiedStudyStats } from "@/hooks/useUnifiedStudyStats";
import { SharedStatsGrid } from "@/components/shared/SharedStatsGrid";
import LearningSummary from "./overview/LearningSummary";
import StudyConsistency from "./overview/StudyConsistency";
import MainProgressStats from "./overview/MainProgressStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProgressOverview = () => {
  const { stats, isLoading } = useUnifiedStudyStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Check if user has any activity
  const hasActivity = stats.totalSessions > 0 || stats.totalCardsMastered > 0 || stats.streakDays > 0;

  if (!hasActivity) {
    return (
      <div className="space-y-8">
        <Card className="bg-gradient-to-br from-mint-50 to-blue-50 border-mint-200">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <BookOpen className="h-12 w-12 text-mint-500" />
                <TrendingUp className="h-8 w-8 text-mint-400" />
              </div>
              <h2 className="text-2xl font-bold text-mint-800 mb-2">Start Your Learning Journey!</h2>
              <p className="text-mint-600 max-w-md mx-auto">
                Your progress will appear here as you start studying. Create flashcard sets, review cards, and track your learning journey.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/flashcards')}
                className="bg-mint-500 hover:bg-mint-600 text-white"
              >
                Browse Flashcard Sets
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/flashcards/create')}
                className="border-mint-200 hover:bg-mint-50 text-mint-700"
              >
                Create Your First Set
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Progress Stats */}
      <MainProgressStats stats={{
        completedCourses: 0, // Placeholder for future course implementation
        totalCourses: 0,     // Placeholder for future course implementation
        completedQuizzes: 0, // Will be calculated from quiz_results
        totalQuizzes: 0,     // Will be calculated from quizzes
        flashcardAccuracy: stats.flashcardAccuracy,
        streakDays: stats.streakDays
      }} />

      {/* Detailed Stats Grid */}
      <SharedStatsGrid stats={stats} isLoading={isLoading} variant="detailed" />

      <h2 className="text-xl font-semibold mt-8 mb-4">Learning Summary</h2>
      <LearningSummary 
        totalCardsMastered={stats.totalCardsMastered} 
        studyTimeHours={stats.studyTimeHours} 
        totalSets={stats.totalSets} 
      />
      
      <StudyConsistency />
    </div>
  );
};

export default ProgressOverview;

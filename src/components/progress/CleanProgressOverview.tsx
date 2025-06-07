
import { useTimezoneAwareAnalytics } from "@/hooks/useTimezoneAwareAnalytics";
import { useSessionCleanup } from "@/hooks/useSessionCleanup";
import { ProgressOverviewCard } from "./overview/ProgressOverviewCard";
import { GradeProgressionChart } from "./grades/GradeProgressionChart";
import { FlashcardMasteryLevels } from "./grades/FlashcardMasteryLevels";
import { DailyStudyTrends } from "./time/DailyStudyTrends";
import { ConsistencyScore } from "./time/ConsistencyScore";
import LearningSummary from "./overview/LearningSummary";
import StudyConsistency from "./overview/StudyConsistency";
import MainProgressStats from "./overview/MainProgressStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CleanProgressOverview = () => {
  const { analytics, isLoading, timezone } = useTimezoneAwareAnalytics();
  const navigate = useNavigate();
  
  // Clean up orphaned sessions on component mount
  useSessionCleanup();

  // Calculate week boundaries for display - with proper error handling
  const getWeekDisplay = () => {
    if (!timezone) return 'Loading...';
    
    try {
      const today = new Date();
      const formatter = new Intl.DateTimeFormat('en-AU', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const todayString = formatter.format(today);
      
      // Validate the date string before using it
      if (!todayString || todayString === 'Invalid Date') {
        return 'Week information unavailable';
      }
      
      const todayDate = new Date(`${todayString}T00:00:00`);
      
      // Check if the date is valid
      if (isNaN(todayDate.getTime())) {
        return 'Week information unavailable';
      }
      
      // Get Monday of this week (proper calculation)
      const dayOfWeek = todayDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(todayDate);
      monday.setDate(monday.getDate() - daysToMonday);
      
      // Get Sunday of this week (exactly 6 days after Monday)
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const weekFormatter = new Intl.DateTimeFormat('en-AU', {
        day: 'numeric',
        month: 'short'
      });
      
      return `${weekFormatter.format(monday)} - ${weekFormatter.format(sunday)}`;
    } catch (error) {
      console.error('Error calculating week display:', error);
      return 'Week information unavailable';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Show enhanced progress overview for users with data
  if (analytics.totalSessions > 0 || analytics.totalStudyTime > 0 || analytics.totalSets > 0) {
    return (
      <div className="space-y-8">
        {/* Week Information Banner */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-blue-800">
              <Calendar className="h-5 w-5" />
              <div>
                <p className="font-medium">Week of {getWeekDisplay()} • {timezone || 'Loading timezone...'}</p>
                <p className="text-sm text-blue-600">
                  Weekly goal progress: {analytics.weeklyStudyTimeMinutes} minutes of {analytics.weeklyGoalMinutes} minutes
                  {analytics.weeklyChange !== 0 && ` • ${analytics.weeklyChange > 0 ? '+' : ''}${analytics.weeklyChange}% vs last week`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Overview Card */}
        <ProgressOverviewCard weekDisplay={getWeekDisplay()} />
        
        {/* Grade Progression Section */}
        <div className="space-y-6">
          <div className="border-b border-mint-200 pb-4">
            <h2 className="text-2xl font-semibold text-mint-800 mb-2">Grade Progression</h2>
            <p className="text-mint-600">Track your journey from C → B → A grades across subjects</p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <GradeProgressionChart />
            <FlashcardMasteryLevels />
          </div>
        </div>
        
        {/* Study Time Analytics Section */}
        <div className="space-y-6">
          <div className="border-b border-mint-200 pb-4">
            <h2 className="text-2xl font-semibold text-mint-800 mb-2">Study Time Analytics</h2>
            <p className="text-mint-600">Analyze your study patterns and consistency • Week runs Monday-Sunday in {timezone || 'your timezone'}</p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <DailyStudyTrends />
            <ConsistencyScore />
          </div>
        </div>
      </div>
    );
  }

  // Show simplified overview for new users
  return (
    <div className="space-y-8">
      {/* Week Information Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-blue-800">
            <Calendar className="h-5 w-5" />
            <div>
              <p className="font-medium">Week of {getWeekDisplay()} • {timezone || 'Loading timezone...'}</p>
              <p className="text-sm text-blue-600">
                Start studying to see your weekly progress here!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Progress Stats Section */}
      <div className="space-y-6">
        <div className="border-b border-mint-200 pb-4">
          <h2 className="text-2xl font-semibold text-mint-800 mb-2">Progress Overview</h2>
          <p className="text-mint-600">Track your learning achievements and performance</p>
        </div>
        
        <MainProgressStats stats={{
          completedCourses: 0,
          totalCourses: 0,
          completedQuizzes: 0,
          totalQuizzes: 0,
          flashcardAccuracy: analytics.flashcardAccuracy,
          streakDays: analytics.streakDays
        }} />
      </div>

      {/* Learning Summary Section */}
      <div className="space-y-6">
        <div className="border-b border-mint-200 pb-4">
          <h2 className="text-xl font-semibold text-mint-800 mb-2">Learning Summary</h2>
          <p className="text-mint-600">Your overall learning achievements and milestones</p>
        </div>
        <LearningSummary 
          totalCardsMastered={analytics.totalCardsMastered} 
          studyTimeHours={analytics.totalStudyTime} 
          totalSets={analytics.totalSets} 
        />
      </div>
      
      {/* Study Consistency Section */}
      <div className="space-y-6">
        <div className="border-b border-mint-200 pb-4">
          <h2 className="text-xl font-semibold text-mint-800 mb-2">Study Consistency</h2>
          <p className="text-mint-600">Your daily study habits over the past month</p>
        </div>
        <StudyConsistency />
      </div>

      {/* Empty State Encouragement Card */}
      <Card className="bg-gradient-to-br from-mint-50 to-blue-50 border-mint-200 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BookOpen className="h-12 w-12 text-mint-500" />
              <TrendingUp className="h-8 w-8 text-mint-400" />
            </div>
            <h2 className="text-2xl font-bold text-mint-800 mb-2">Start Your Learning Journey!</h2>
            <p className="text-mint-600 max-w-md mx-auto">
              Your progress will appear above as you start studying. Create flashcard sets, review cards, and track your learning journey.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate('/flashcards')}
              className="bg-mint-500 hover:bg-mint-600 text-white shadow-sm"
            >
              Browse Flashcard Sets
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/flashcards/create')}
              className="border-mint-200 hover:bg-mint-50 text-mint-700 shadow-sm"
            >
              Create Your First Set
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

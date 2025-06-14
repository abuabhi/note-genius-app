
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, Calendar, BookOpen, Award, AlertTriangle, Globe, CheckCircle } from 'lucide-react';
import { useTimezoneAwareAnalytics } from '@/hooks/useTimezoneAwareAnalytics';
import { useBasicSessionTracker } from '@/hooks/useBasicSessionTracker';

export const AnalyticsOverview = () => {
  const { analytics, isLoading, error } = useTimezoneAwareAnalytics();
  const { isActive, elapsedSeconds, isPaused } = useBasicSessionTracker();

  console.log('📊 AnalyticsOverview render state:', { 
    isLoading, 
    hasError: !!error, 
    hasAnalytics: !!analytics,
    analyticsKeys: analytics ? Object.keys(analytics) : []
  });

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Show error state
  if (error) {
    console.error('❌ Analytics error in component:', error);
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Error loading analytics</p>
                <p className="text-sm text-red-600">
                  {error.message || 'An unknown error occurred'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Main content with analytics data
  return (
    <div className="space-y-6">
      {/* Success indicator */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Analytics loaded successfully!</p>
              <p className="text-sm text-green-600">
                Timezone: {analytics.timezone} • 
                Sessions: {analytics.totalSessions} • 
                Study Time: {analytics.totalStudyTime}h
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-blue-800">
            <Globe className="h-5 w-5" />
            <div>
              <p className="font-medium">Timezone-Aware Analytics</p>
              <p className="text-sm text-blue-600">
                Statistics calculated for: {analytics.timezone} • 
                Today: {analytics.todayString} • 
                Current time: {new Date().toLocaleString(undefined, { timeZone: analytics.timezone })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Session Status */}
      {isActive && (
        <Card className="border-mint-200 bg-gradient-to-r from-mint-50 to-mint-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-mint-800">
              <Clock className="h-5 w-5" />
              Current Study Session
              <Badge variant={isPaused ? "secondary" : "default"} className="ml-2">
                {isPaused ? "Paused" : "Active"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-mint-900 mb-2">
              {formatTime(elapsedSeconds)}
            </div>
            <p className="text-mint-600">Keep up the great work!</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Study Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayStudyTime}h</div>
            <p className="text-xs text-muted-foreground">
              {analytics.todaySessions} sessions completed today
            </p>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.weeklyGoalProgress}%</div>
            <Progress value={analytics.weeklyGoalProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {analytics.weeklyStudyTime}h of {analytics.weeklyGoalHours}h goal
            </p>
          </CardContent>
        </Card>

        {/* Total Study Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStudyTime}h</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalSessions} total sessions
            </p>
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Mastered</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCardsMastered}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.flashcardAccuracy}% accuracy rate
            </p>
          </CardContent>
        </Card>

        {/* Study Streak */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.streakDays}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.streakDays === 1 ? "day" : "days"} in a row
            </p>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Change</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.weeklyChange >= 0 ? '+' : ''}{analytics.weeklyChange}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-800">{analytics.totalQuizzes}</div>
                <div className="text-sm text-blue-600">Quizzes Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-green-800">{analytics.completedQuizzes}</div>
                <div className="text-sm text-green-600">Quizzes Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-800">{analytics.totalNotes}</div>
                <div className="text-sm text-purple-600">Notes Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Data Summary */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">Debug Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>Sessions: {analytics.totalSessions}</div>
            <div>Sets: {analytics.totalSets}</div>
            <div>Notes: {analytics.totalNotes}</div>
            <div>Quizzes: {analytics.totalQuizzes}</div>
            <div>Study Time: {analytics.totalStudyTimeMinutes}min</div>
            <div>Cards: {analytics.totalCardsReviewed}</div>
            <div>Accuracy: {analytics.flashcardAccuracy}%</div>
            <div>Streak: {analytics.streakDays} days</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

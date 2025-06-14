
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, Calendar, BookOpen, Award } from 'lucide-react';
import { useTimezoneAwareAnalytics } from '@/hooks/useTimezoneAwareAnalytics';
import { useBasicSessionTracker } from '@/hooks/useBasicSessionTracker';

export const AnalyticsOverview = () => {
  const { analytics, isLoading } = useTimezoneAwareAnalytics();
  const { isActive, elapsedSeconds, isPaused } = useBasicSessionTracker();

  console.log('📊 AnalyticsOverview render:', { analytics, isLoading });

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
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
    );
  }

  // Add fallback data to prevent blank display
  const safeAnalytics = {
    todayStudyTime: analytics?.todayStudyTime || 0,
    todaySessions: analytics?.todaySessions || 0,
    weeklyGoalProgress: analytics?.weeklyGoalProgress || 0,
    weeklyStudyTime: analytics?.weeklyStudyTime || 0,
    weeklyGoalHours: analytics?.weeklyGoalHours || 5,
    totalStudyTime: analytics?.totalStudyTime || 0,
    totalSessions: analytics?.totalSessions || 0,
    totalCardsMastered: analytics?.totalCardsMastered || 0,
    flashcardAccuracy: analytics?.flashcardAccuracy || 0,
    streakDays: analytics?.streakDays || 0,
    weeklyChange: analytics?.weeklyChange || 0,
    totalQuizzes: analytics?.totalQuizzes || 0,
    completedQuizzes: analytics?.completedQuizzes || 0,
    totalNotes: analytics?.totalNotes || 0
  };

  return (
    <div className="space-y-6">
      {/* Debug info */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="text-sm text-yellow-800">
            <p>Debug: Analytics loaded = {analytics ? 'Yes' : 'No'}</p>
            <p>Total Sessions: {safeAnalytics.totalSessions}</p>
            <p>Today Study Time: {safeAnalytics.todayStudyTime}h</p>
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
            <div className="text-2xl font-bold">{safeAnalytics.todayStudyTime}h</div>
            <p className="text-xs text-muted-foreground">
              {safeAnalytics.todaySessions} sessions completed
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
            <div className="text-2xl font-bold">{safeAnalytics.weeklyGoalProgress}%</div>
            <Progress value={safeAnalytics.weeklyGoalProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {safeAnalytics.weeklyStudyTime}h of {safeAnalytics.weeklyGoalHours}h goal
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
            <div className="text-2xl font-bold">{safeAnalytics.totalStudyTime}h</div>
            <p className="text-xs text-muted-foreground">
              {safeAnalytics.totalSessions} total sessions
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
            <div className="text-2xl font-bold">{safeAnalytics.totalCardsMastered}</div>
            <p className="text-xs text-muted-foreground">
              {safeAnalytics.flashcardAccuracy}% accuracy rate
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
            <div className="text-2xl font-bold">{safeAnalytics.streakDays}</div>
            <p className="text-xs text-muted-foreground">
              {safeAnalytics.streakDays === 1 ? "day" : "days"} in a row
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
            <div className={`text-2xl font-bold ${safeAnalytics.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {safeAnalytics.weeklyChange >= 0 ? '+' : ''}{safeAnalytics.weeklyChange}%
            </div>
            <p className="text-xs text-muted-foreground">
              vs last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-800">{safeAnalytics.totalQuizzes}</div>
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
                <div className="text-lg font-semibold text-green-800">{safeAnalytics.completedQuizzes}</div>
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
                <div className="text-lg font-semibold text-purple-800">{safeAnalytics.totalNotes}</div>
                <div className="text-sm text-purple-600">Notes Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

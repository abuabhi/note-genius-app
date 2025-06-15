
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, Calendar, BookOpen, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTimezoneAwareAnalytics } from '@/hooks/useTimezoneAwareAnalytics';
import { useBasicSessionTracker } from '@/hooks/useBasicSessionTracker';
import { useAuth } from '@/hooks/auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AnalyticsOverview = () => {
  const { analytics, isLoading, error } = useTimezoneAwareAnalytics();
  const { isActive, elapsedSeconds, isPaused } = useBasicSessionTracker();
  const { user } = useAuth();

  // Get user's weekly goal from profile
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('weekly_study_goal_hours')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Get total flashcards and mastered count
  const { data: flashcardStats } = useQuery({
    queryKey: ['flashcardStats', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, mastered: 0 };
      
      // Get total flashcards in user's sets
      const { data: totalCards, error: totalError } = await supabase
        .from('flashcards')
        .select('id')
        .in('set_id', 
          supabase
            .from('flashcard_sets')
            .select('id')
            .eq('user_id', user.id)
        );

      if (totalError) throw totalError;

      // Get mastered flashcards (high mastery level and good performance)
      const { data: masteredCards, error: masteredError } = await supabase
        .from('user_flashcard_progress')
        .select('id')
        .eq('user_id', user.id)
        .gte('mastery_level', 4) // High mastery level
        .gte('ease_factor', 2.5); // Good retention

      if (masteredError) throw masteredError;

      return {
        total: totalCards?.length || 0,
        mastered: masteredCards?.length || 0
      };
    },
    enabled: !!user
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

  const weeklyGoalHours = userProfile?.weekly_study_goal_hours || 5;
  const weeklyGoalMinutes = weeklyGoalHours * 60;
  const weeklyProgress = Math.min(Math.round((analytics.weeklyStudyTimeMinutes / weeklyGoalMinutes) * 100), 100);

  if (error) {
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

  return (
    <div className="space-y-6">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.todayStudyTime}h</div>
            <p className="text-xs text-muted-foreground">
              {analytics.todaySessions} sessions completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyProgress}%</div>
            <Progress value={weeklyProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(analytics.weeklyStudyTimeMinutes / 60 * 10) / 10}h of {weeklyGoalHours}h goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Mastered</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flashcardStats?.mastered || 0} of {flashcardStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {flashcardStats?.total ? Math.round((flashcardStats.mastered / flashcardStats.total) * 100) : 0}% mastery rate
            </p>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcard Sets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSets}</div>
            <p className="text-xs text-muted-foreground">
              sets created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Summary */}
      {analytics.weeklyChange !== 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-blue-800">
              <TrendingUp className={`h-5 w-5 ${analytics.weeklyChange > 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="font-medium">
                  {analytics.weeklyChange > 0 ? '📈 Great progress this week!' : '📉 Less activity this week'}
                </p>
                <p className="text-sm text-blue-600">
                  {analytics.weeklyChange > 0 ? '+' : ''}{analytics.weeklyChange}% compared to last week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

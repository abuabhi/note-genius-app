import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, Calendar, BookOpen, Award, AlertTriangle, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import { useUnifiedAnalytics } from '@/hooks/useUnifiedAnalytics';
import { useBasicSessionTracker } from '@/hooks/useBasicSessionTracker';
import { useAuth } from '@/hooks/auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AnalyticsOverview = () => {
  const { analytics, isLoading, error } = useUnifiedAnalytics();
  const { isActive, elapsedSeconds, isPaused } = useBasicSessionTracker();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // Get flashcard statistics
  const { data: flashcardStats } = useQuery({
    queryKey: ['flashcardStats', user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, mastered: 0, sets: 0 };
      
      // Get user's flashcard sets and their card counts
      const { data: userSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('id, card_count')
        .eq('user_id', user.id);

      if (setsError) throw setsError;

      const totalSets = userSets?.length || 0;
      const totalCards = userSets?.reduce((sum, set) => sum + (set.card_count || 0), 0) || 0;

      if (totalCards === 0) {
        return { total: 0, mastered: 0, sets: totalSets };
      }

      // Get mastered cards from learning progress
      const setIds = userSets?.map(set => set.id) || [];
      
      if (setIds.length === 0) {
        return { total: totalCards, mastered: 0, sets: totalSets };
      }

      // Get flashcards that belong to user's sets
      const { data: userFlashcards, error: flashcardsError } = await supabase
        .from('flashcard_set_cards')
        .select('flashcard_id')
        .in('set_id', setIds);

      if (flashcardsError) throw flashcardsError;

      const flashcardIds = userFlashcards?.map(fc => fc.flashcard_id) || [];

      if (flashcardIds.length === 0) {
        return { total: totalCards, mastered: 0, sets: totalSets };
      }

      // Count mastered cards from learning progress
      const { data: masteredCards, error: masteredError } = await supabase
        .from('learning_progress')
        .select('id')
        .eq('user_id', user.id)
        .in('flashcard_id', flashcardIds)
        .or('is_known.eq.true,confidence_level.gte.4');

      if (masteredError) throw masteredError;

      return {
        total: totalCards,
        mastered: masteredCards?.length || 0,
        sets: totalSets
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

  // Check if user is new (no flashcard sets or study time)
  const isNewUser = (flashcardStats?.sets || 0) === 0 && analytics.totalStudyTime === 0;

  return (
    <div className="space-y-6">
      {/* New User Welcome Section */}
      {isNewUser && (
        <Card className="border-mint-200 bg-gradient-to-r from-mint-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-mint-600" />
                  <h3 className="text-lg font-semibold text-mint-800">Welcome to Your Learning Journey!</h3>
                </div>
                <p className="text-mint-600 mb-4">
                  Start by creating your first flashcard set to see your progress and analytics here.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate('/flashcards/create')}
                    className="bg-mint-500 hover:bg-mint-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Set
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/flashcards')}
                    className="border-mint-200 hover:bg-mint-50 text-mint-700"
                  >
                    Browse Library
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="text-2xl font-bold">{analytics.todayStudyTimeMinutes / 60}h</div>
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
              {flashcardStats?.sets === 0 && (
                <span className="block text-mint-600 mt-1">Create your first flashcard set!</span>
              )}
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
            <div className="text-2xl font-bold">{flashcardStats?.sets || 0}</div>
            <p className="text-xs text-muted-foreground">
              sets created
              {flashcardStats?.sets === 0 && (
                <span className="block text-mint-600 mt-1">Start with your first set!</span>
              )}
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

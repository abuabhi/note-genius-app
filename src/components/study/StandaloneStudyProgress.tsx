
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Calendar, Zap, Star, Target, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { format, subDays, isToday, isYesterday, startOfDay, endOfDay } from 'date-fns';

interface ProgressStats {
  cardsReviewedToday: number;
  totalCardsReviewed: number;
  totalCardsMastered: number;
  flashcardAccuracy: number;
  studyTimeHours: number;
  streak: number;
}

interface Achievement {
  id: string;
  title: string;
  badge_image: string;
}

export const StandaloneStudyProgress = () => {
  const { user } = useAuth();

  // Fetch progress stats with direct Supabase queries
  const { data: stats = {
    cardsReviewedToday: 0,
    totalCardsReviewed: 0,
    totalCardsMastered: 0,
    flashcardAccuracy: 0,
    studyTimeHours: 0,
    streak: 0
  }, isLoading: statsLoading } = useQuery({
    queryKey: ['standalone-progress-stats', user?.id],
    queryFn: async (): Promise<ProgressStats> => {
      if (!user) throw new Error("No user");

      // Get today's reviews
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      const [
        { data: todayReviews },
        { data: allProgress },
        { data: studySessions },
        { data: progressData }
      ] = await Promise.all([
        supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .gte('last_reviewed_at', startOfToday)
          .lte('last_reviewed_at', endOfToday),
        
        supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id),
        
        supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .not('duration', 'is', null),
        
        supabase
          .from('user_flashcard_progress')
          .select('last_reviewed_at, last_score')
          .eq('user_id', user.id)
          .not('last_reviewed_at', 'is', null)
          .order('last_reviewed_at', { ascending: false })
      ]);

      // Calculate streak
      let streak = 0;
      if (progressData && progressData.length > 0) {
        const uniqueDates = Array.from(
          new Set(
            progressData.map(item => 
              format(new Date(item.last_reviewed_at), 'yyyy-MM-dd')
            )
          )
        ).map(dateStr => new Date(dateStr)).sort((a, b) => b.getTime() - a.getTime());

        if (uniqueDates.length > 0) {
          const mostRecentDate = uniqueDates[0];
          mostRecentDate.setHours(0, 0, 0, 0);
          
          if (isToday(mostRecentDate) || isYesterday(mostRecentDate)) {
            streak = 1;
            let currentDate = mostRecentDate;
            
            for (let i = 1; i < uniqueDates.length; i++) {
              const nextDate = uniqueDates[i];
              nextDate.setHours(0, 0, 0, 0);
              
              const expectedDate = subDays(currentDate, 1);
              expectedDate.setHours(0, 0, 0, 0);

              if (nextDate.getTime() === expectedDate.getTime()) {
                streak++;
                currentDate = nextDate;
              } else {
                break;
              }
            }
          }
        }
      }

      // Calculate accuracy
      let flashcardAccuracy = 0;
      if (allProgress && allProgress.length > 0) {
        const recentReviews = allProgress.filter(p => p.last_score !== null);
        if (recentReviews.length > 0) {
          const totalScore = recentReviews.reduce((sum, p) => sum + (p.last_score || 0), 0);
          flashcardAccuracy = Math.round((totalScore / (recentReviews.length * 5)) * 100);
        }
      }

      // Calculate study time
      const totalMinutes = studySessions ? 
        studySessions.reduce((sum, session) => sum + (session.duration || 0), 0) : 0;
      const studyTimeHours = Math.round(totalMinutes / 60 * 10) / 10;

      // Calculate mastered cards
      const masteredCards = allProgress ? 
        allProgress.filter(p => 
          p.ease_factor && p.ease_factor >= 2.5 && 
          p.interval && p.interval >= 7
        ).length : 0;

      return {
        cardsReviewedToday: todayReviews?.length || 0,
        totalCardsReviewed: allProgress?.length || 0,
        totalCardsMastered: masteredCards,
        flashcardAccuracy,
        studyTimeHours,
        streak
      };
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // 1 minute
  });

  // Fetch achievements separately and independently
  const { data: achievements = [] } = useQuery({
    queryKey: ['standalone-achievements', user?.id],
    queryFn: async (): Promise<Achievement[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('study_achievements')
        .select('id, title, badge_image')
        .eq('user_id', user.id)
        .not('achieved_at', 'is', null)
        .order('achieved_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching achievements:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 300000 // 5 minutes
  });

  // Show simple loading state
  if (!user) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Study Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-muted-foreground">Please log in to view progress</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statsLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Study Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            <span className="text-2xl font-bold">{stats.streak} days</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Cards Reviewed</span>
            </div>
            <span className="font-semibold">{stats.cardsReviewedToday}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <span className="text-sm">Study Time</span>
            </div>
            <span className="font-semibold">{stats.studyTimeHours}h</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Cards Mastered</span>
              <span className="font-semibold">{stats.totalCardsMastered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Reviewed</span>
              <span className="font-semibold">{stats.totalCardsReviewed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Accuracy</span>
              <span className="font-semibold">{stats.flashcardAccuracy}%</span>
            </div>
            {stats.flashcardAccuracy > 0 && (
              <Progress value={stats.flashcardAccuracy} className="h-2" />
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="space-y-2">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-2 text-sm">
                  <div className="rounded-full bg-primary/20 p-1">
                    {achievement.badge_image === 'Award' && <Award className="h-3 w-3 text-primary" />}
                    {achievement.badge_image === 'Calendar' && <Calendar className="h-3 w-3 text-primary" />}
                    {achievement.badge_image === 'Star' && <Star className="h-3 w-3 text-primary" />}
                    {achievement.badge_image === 'Zap' && <Zap className="h-3 w-3 text-primary" />}
                    {!['Award', 'Calendar', 'Star', 'Zap'].includes(achievement.badge_image) && 
                      <Award className="h-3 w-3 text-primary" />}
                  </div>
                  <span className="text-xs font-medium">{achievement.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">
                Start studying to earn achievements!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

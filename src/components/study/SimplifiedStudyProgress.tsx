
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Calendar, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { format, startOfDay, endOfDay } from 'date-fns';

interface SimpleStats {
  cardsStudiedToday: number;
  totalCardsMastered: number;
  currentStreak: number;
  totalSetsStarted: number;
}

export const SimplifiedStudyProgress = () => {
  const { user } = useAuth();

  const { data: stats = {
    cardsStudiedToday: 0,
    totalCardsMastered: 0,
    currentStreak: 0,
    totalSetsStarted: 0
  }, isLoading } = useQuery({
    queryKey: ['simplified-progress-stats', user?.id],
    queryFn: async (): Promise<SimpleStats> => {
      if (!user) throw new Error("No user");

      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      const endOfToday = endOfDay(today).toISOString();

      const [
        { data: todayProgress },
        { data: allProgress },
        { data: streakData }
      ] = await Promise.all([
        // Today's cards studied
        supabase
          .from('simple_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .gte('last_reviewed_at', startOfToday)
          .lte('last_reviewed_at', endOfToday),
        
        // All mastered cards
        supabase
          .from('simple_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'mastered'),
        
        // Streak calculation (last 7 days)
        supabase
          .from('simple_flashcard_progress')
          .select('last_reviewed_at')
          .eq('user_id', user.id)
          .not('last_reviewed_at', 'is', null)
          .order('last_reviewed_at', { ascending: false })
          .limit(100)
      ]);

      // Calculate simple streak (consecutive days with activity)
      let currentStreak = 0;
      if (streakData && streakData.length > 0) {
        const uniqueDates = Array.from(
          new Set(
            streakData.map(item => 
              format(new Date(item.last_reviewed_at), 'yyyy-MM-dd')
            )
          )
        ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const todayStr = format(today, 'yyyy-MM-dd');
        const yesterdayStr = format(new Date(today.getTime() - 24*60*60*1000), 'yyyy-MM-dd');
        
        if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
          currentStreak = 1;
          let currentDate = new Date(uniqueDates[0]);
          
          for (let i = 1; i < Math.min(uniqueDates.length, 7); i++) {
            const nextDate = new Date(uniqueDates[i]);
            const dayDiff = (currentDate.getTime() - nextDate.getTime()) / (24*60*60*1000);
            
            if (dayDiff === 1) {
              currentStreak++;
              currentDate = nextDate;
            } else {
              break;
            }
          }
        }
      }

      return {
        cardsStudiedToday: todayProgress?.length || 0,
        totalCardsMastered: allProgress?.length || 0,
        currentStreak,
        totalSetsStarted: 0 // Simplified - can be enhanced later
      };
    },
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000
  });

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

  if (isLoading) {
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
          <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Cards Studied</span>
            </div>
            <span className="font-semibold">{stats.cardsStudiedToday}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-sm">Study Streak</span>
            </div>
            <span className="font-semibold">{stats.currentStreak} days</span>
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
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Cards Mastered</span>
              </div>
              <span className="font-semibold">{stats.totalCardsMastered}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Learning Progress</span>
              </div>
              <span className="font-semibold">
                {stats.totalCardsMastered > 0 ? "Active" : "Getting Started"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle, TrendingUp, Flame, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { format, startOfDay, endOfDay } from 'date-fns';

interface SimpleStats {
  cardsStudiedToday: number;
  totalCardsMastered: number;
  currentStreak: number;
  totalSetsStarted: number;
}

const StatCard = ({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className={`rounded-lg border border-mint-100 p-3 ${color}`}>
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-md bg-mint-100">
        <Icon className="h-4 w-4 text-mint-600" />
      </div>
      <div>
        <p className="text-sm text-mint-600">{label}</p>
        <p className="text-base font-medium text-mint-800">{value}</p>
      </div>
    </div>
  </div>
);

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
        <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-mint-800">
              <TrendingUp className="h-4 w-4 text-mint-500" />
              Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="w-10 h-10 bg-mint-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-5 w-5 text-mint-500" />
              </div>
              <p className="text-sm text-muted-foreground">Please log in to view progress</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2 text-mint-800">
              <TrendingUp className="h-4 w-4 text-mint-500" />
              Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-mint-50 rounded-md animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-mint-50 rounded animate-pulse" />
                    <div className="h-3 bg-mint-50 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-mint-800">
            <TrendingUp className="h-4 w-4 text-mint-500" />
            Study Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatCard
            icon={Flame}
            label="Study Streak"
            value={`${stats.currentStreak} days`}
            color="bg-mint-50"
          />
          
          <StatCard
            icon={CheckCircle}
            label="Cards Mastered"
            value={stats.totalCardsMastered}
            color="bg-mint-50"
          />
          
          <StatCard
            icon={Award}
            label="Progress Level"
            value={stats.totalCardsMastered > 0 ? "Active Learner" : "Getting Started"}
            color="bg-mint-50"
          />
        </CardContent>
      </Card>
    </div>
  );
};

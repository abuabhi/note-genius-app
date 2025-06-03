import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Calendar, TrendingUp, Flame, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { format, startOfDay, endOfDay } from 'date-fns';
import { motion } from "framer-motion";

interface SimpleStats {
  cardsStudiedToday: number;
  totalCardsMastered: number;
  currentStreak: number;
  totalSetsStarted: number;
}

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.2 }}
    className="flex items-center justify-between p-3 bg-white rounded-lg border border-mint-100 hover:shadow-sm transition-shadow"
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-mint-800">{value}</p>
      </div>
    </div>
  </motion.div>
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
        <Card className="border-mint-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-mint-800">
              <TrendingUp className="h-4 w-4" />
              Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-mint-400" />
              </div>
              <p className="text-muted-foreground text-sm">Please log in to view progress</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="border-mint-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-mint-800">
              <TrendingUp className="h-4 w-4" />
              Study Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-mint-100 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 bg-mint-100 rounded animate-pulse" />
                    <div className="h-3 bg-mint-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dailyGoal = 20; // Can be made configurable
  const dailyProgress = Math.min((stats.cardsStudiedToday / dailyGoal) * 100, 100);

  return (
    <div className="space-y-4">
      {/* Today's Progress */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="bg-mint-50 border-mint-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-mint-800">
              <Target className="h-4 w-4" />
              Today's Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-mint-700 mb-1">
                {stats.cardsStudiedToday}
              </div>
              <div className="text-sm text-mint-600 mb-3">
                of {dailyGoal} cards studied
              </div>
              <Progress 
                value={dailyProgress} 
                className="h-2 bg-mint-100" 
                indicatorClassName="bg-mint-500"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="space-y-2">
        <StatCard
          icon={Flame}
          label="Study Streak"
          value={`${stats.currentStreak} days`}
          color="bg-orange-400"
          delay={0.1}
        />
        
        <StatCard
          icon={CheckCircle}
          label="Cards Mastered"
          value={stats.totalCardsMastered}
          color="bg-mint-500"
          delay={0.2}
        />
        
        <StatCard
          icon={Award}
          label="Progress Level"
          value={stats.totalCardsMastered > 0 ? "Active Learner" : "Getting Started"}
          color="bg-indigo-400"
          delay={0.3}
        />
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.2 }}
      >
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3 text-center">
            <div className="text-lg mb-1">🎯</div>
            <p className="text-sm font-medium text-amber-800">
              {stats.cardsStudiedToday === 0 
                ? "Ready to start learning? Let's go!" 
                : stats.cardsStudiedToday >= dailyGoal
                ? "Amazing! You've reached your daily goal!"
                : `${dailyGoal - stats.cardsStudiedToday} more cards to reach your goal!`
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

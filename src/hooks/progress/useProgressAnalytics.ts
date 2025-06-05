
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { startOfWeek, endOfWeek, subDays, format } from 'date-fns';

export interface OverviewStats {
  currentStreak: number;
  todaysCardsReviewed: number;
  todaysStudyTime: number;
  todaysQuizzes: number;
  weeklyGoalProgress: number;
  weeklyStudyTime: number;
  totalCardsMastered: number;
}

export interface GradeProgression {
  subject: string;
  cardCount: number;
  gradeDistribution: { grade: 'A' | 'B' | 'C'; count: number; percentage: number }[];
  masteryLevel: number;
  averageTimeToMaster: number;
}

export interface StudyTimeAnalytics {
  dailyTrends: { date: string; minutes: number; cardsReviewed: number }[];
  weeklyComparison: { thisWeek: number; lastWeek: number; percentageChange: number };
  consistencyScore: number;
  optimalStudyTime: string;
}

export interface ProgressAnalytics {
  overviewStats: OverviewStats;
  gradeProgression: GradeProgression[];
  studyTimeAnalytics: StudyTimeAnalytics;
  isLoading: boolean;
  error: Error | null;
}

export const useProgressAnalytics = (): ProgressAnalytics => {
  const { user } = useAuth();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['progress-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const today = new Date();
      const startOfToday = format(today, 'yyyy-MM-dd');
      const thirtyDaysAgo = format(subDays(today, 30), 'yyyy-MM-dd');
      const thisWeekStart = format(startOfWeek(today), 'yyyy-MM-dd');
      const lastWeekStart = format(startOfWeek(subDays(today, 7)), 'yyyy-MM-dd');
      const lastWeekEnd = format(endOfWeek(subDays(today, 7)), 'yyyy-MM-dd');

      // Get today's activity
      const [todayReviews, todaySessions, todayQuizResults] = await Promise.all([
        supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .gte('last_reviewed_at', `${startOfToday}T00:00:00Z`)
          .lt('last_reviewed_at', `${startOfToday}T23:59:59Z`),
        
        supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .gte('start_time', `${startOfToday}T00:00:00Z`)
          .lt('start_time', `${startOfToday}T23:59:59Z`)
          .not('duration', 'is', null),
        
        supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .gte('completed_at', `${startOfToday}T00:00:00Z`)
          .lt('completed_at', `${startOfToday}T23:59:59Z`)
      ]);

      // Get flashcard progress for grade analysis
      const { data: flashcardProgress } = await supabase
        .from('user_flashcard_progress')
        .select(`
          *,
          flashcard:flashcards(
            id,
            front_content,
            flashcard_set_cards!inner(
              flashcard_sets!inner(subject)
            )
          )
        `)
        .eq('user_id', user.id);

      // Get study sessions for time analytics
      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('start_time, duration, created_at')
        .eq('user_id', user.id)
        .gte('start_time', `${thirtyDaysAgo}T00:00:00Z`)
        .not('duration', 'is', null)
        .order('start_time', { ascending: true });

      // Calculate overview stats
      const todaysCardsReviewed = todayReviews.data?.length || 0;
      const todaysStudyTime = Math.round(
        (todaySessions.data?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0) / 60
      );
      const todaysQuizzes = todayQuizResults.data?.length || 0;

      // Calculate weekly study time
      const thisWeekSessions = studySessions?.filter(s => 
        s.start_time >= `${thisWeekStart}T00:00:00Z`
      ) || [];
      const lastWeekSessions = studySessions?.filter(s => 
        s.start_time >= `${lastWeekStart}T00:00:00Z` && 
        s.start_time <= `${lastWeekEnd}T23:59:59Z`
      ) || [];

      const weeklyStudyTime = Math.round(
        thisWeekSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
      );
      const lastWeekStudyTime = Math.round(
        lastWeekSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
      );

      const weeklyGoal = 300; // 5 hours in minutes
      const weeklyGoalProgress = Math.min((weeklyStudyTime / weeklyGoal) * 100, 100);

      // Calculate current streak (simplified)
      const currentStreak = todaysCardsReviewed > 0 ? 1 : 0;

      // Calculate total cards mastered (mastery_level >= 3 or grade 'A')
      const totalCardsMastered = flashcardProgress?.filter(p => 
        p.mastery_level >= 3 || p.grade === 'A'
      ).length || 0;

      // Calculate grade progression by subject
      const subjectGroups = flashcardProgress?.reduce((acc: Record<string, any[]>, progress) => {
        const subject = progress.flashcard?.flashcard_set_cards?.[0]?.flashcard_sets?.subject || 'Unknown';
        if (!acc[subject]) {
          acc[subject] = [];
        }
        acc[subject].push(progress);
        return acc;
      }, {}) || {};

      const gradeProgression: GradeProgression[] = Object.entries(subjectGroups).map(([subject, cards]) => {
        const gradeDistribution = ['A', 'B', 'C'].map(grade => {
          const count = cards.filter(c => c.grade === grade).length;
          return {
            grade: grade as 'A' | 'B' | 'C',
            count,
            percentage: cards.length > 0 ? Math.round((count / cards.length) * 100) : 0
          };
        });

        const masteryLevel = Math.round(
          (cards.reduce((sum, c) => sum + (c.mastery_level || 1), 0) / cards.length) * 20
        );

        const averageTimeToMaster = Math.round(
          cards
            .filter(c => c.time_to_master_days)
            .reduce((sum, c) => sum + c.time_to_master_days, 0) / 
          Math.max(cards.filter(c => c.time_to_master_days).length, 1)
        );

        return {
          subject,
          cardCount: cards.length,
          gradeDistribution,
          masteryLevel,
          averageTimeToMaster
        };
      });

      // Calculate study time analytics
      const dailyTrends = Array.from({ length: 30 }, (_, i) => {
        const date = format(subDays(today, 29 - i), 'yyyy-MM-dd');
        const daySessions = studySessions?.filter(s => 
          s.start_time?.startsWith(date)
        ) || [];
        const dayReviews = flashcardProgress?.filter(p => 
          p.last_reviewed_at?.startsWith(date)
        ) || [];

        return {
          date,
          minutes: Math.round(daySessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60),
          cardsReviewed: dayReviews.length
        };
      });

      const weeklyComparison = {
        thisWeek: weeklyStudyTime,
        lastWeek: lastWeekStudyTime,
        percentageChange: lastWeekStudyTime > 0 ? 
          Math.round(((weeklyStudyTime - lastWeekStudyTime) / lastWeekStudyTime) * 100) : 0
      };

      // Calculate consistency score (simplified)
      const recentDailyMinutes = dailyTrends.slice(-7).map(d => d.minutes);
      const average = recentDailyMinutes.reduce((sum, m) => sum + m, 0) / 7;
      const variance = recentDailyMinutes.reduce((sum, m) => sum + Math.pow(m - average, 2), 0) / 7;
      const consistencyScore = Math.max(0, Math.round(100 - Math.sqrt(variance)));

      // Determine optimal study time (simplified)
      const optimalStudyTime = "Morning (9-11 AM)"; // Would be calculated from performance data

      return {
        overviewStats: {
          currentStreak,
          todaysCardsReviewed,
          todaysStudyTime,
          todaysQuizzes,
          weeklyGoalProgress,
          weeklyStudyTime,
          totalCardsMastered
        },
        gradeProgression,
        studyTimeAnalytics: {
          dailyTrends,
          weeklyComparison,
          consistencyScore,
          optimalStudyTime
        }
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  return {
    overviewStats: analytics?.overviewStats || {
      currentStreak: 0,
      todaysCardsReviewed: 0,
      todaysStudyTime: 0,
      todaysQuizzes: 0,
      weeklyGoalProgress: 0,
      weeklyStudyTime: 0,
      totalCardsMastered: 0
    },
    gradeProgression: analytics?.gradeProgression || [],
    studyTimeAnalytics: analytics?.studyTimeAnalytics || {
      dailyTrends: [],
      weeklyComparison: { thisWeek: 0, lastWeek: 0, percentageChange: 0 },
      consistencyScore: 0,
      optimalStudyTime: "Morning"
    },
    isLoading,
    error: error as Error | null
  };
};

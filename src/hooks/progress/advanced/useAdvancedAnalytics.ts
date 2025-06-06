
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useProgressAnalytics } from "../useProgressAnalytics";
import { subMonths, format } from 'date-fns';
import { AdvancedAnalytics, StudySession } from './types';
import { calculatePerformancePrediction } from './performancePredictionCalculations';
import { calculateComparativeMetrics } from './comparativeMetricsCalculations';
import { generateStudyRecommendations } from './studyRecommendationCalculations';
import { calculateLearningVelocityTrend, calculateOptimalStudyDuration } from './learningVelocityCalculations';

export const useAdvancedAnalytics = () => {
  const { user } = useAuth();
  const { overviewStats, gradeProgression, studyTimeAnalytics } = useProgressAnalytics();

  const { data: advancedAnalytics, isLoading } = useQuery({
    queryKey: ['advanced-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('Fetching advanced analytics for user:', user.id);

      // Get extended historical data for predictions
      const sixMonthsAgo = format(subMonths(new Date(), 6), 'yyyy-MM-dd');
      
      const [historicalSessions, allUsersComparison, userGoals] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', `${sixMonthsAgo}T00:00:00Z`)
          .not('duration', 'is', null),
        
        supabase
          .from('study_sessions')
          .select('user_id, duration')
          .not('duration', 'is', null)
          .gte('start_time', `${sixMonthsAgo}T00:00:00Z`)
          .gt('duration', 0), // Only sessions with actual duration
        
        supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      const sessions = (historicalSessions.data || []) as StudySession[];
      const allSessions = (allUsersComparison.data || []) as Array<{ user_id: string; duration: number }>;
      const goals = userGoals.data || [];

      console.log('Sessions found:', sessions.length);
      console.log('All user sessions for comparison:', allSessions.length);
      console.log('User goals:', goals.length);

      // Only calculate analytics if we have sufficient data
      const hasMinimumData = sessions.length > 0 || (overviewStats && overviewStats.totalSessions > 0);

      if (!hasMinimumData) {
        console.log('Insufficient data for analytics, returning defaults');
        return {
          performancePrediction: {
            weeklyGoalLikelihood: 0,
            optimalStudyTimes: [],
            difficultyProgression: 'optimal' as const,
            burnoutRisk: 'low' as const,
            recommendedBreakFrequency: 25
          },
          comparativeMetrics: {
            performancePercentile: 50,
            averagePeerStudyTime: 0,
            streakComparison: 'average' as const,
            subjectRankings: []
          },
          studyRecommendations: [],
          learningVelocityTrend: 'stable' as const,
          optimalStudyDuration: 25
        } as AdvancedAnalytics;
      }

      // Calculate Performance Predictions with real data
      const performancePrediction = calculatePerformancePrediction(
        sessions,
        overviewStats,
        studyTimeAnalytics
      );

      // Calculate Comparative Metrics with real data
      const comparativeMetrics = calculateComparativeMetrics(
        sessions,
        allSessions,
        gradeProgression
      );

      // Generate Study Recommendations based on real patterns
      const studyRecommendations = generateStudyRecommendations(
        overviewStats,
        gradeProgression,
        studyTimeAnalytics,
        performancePrediction,
        goals
      );

      // Calculate Learning Velocity Trend from real sessions
      const learningVelocityTrend = calculateLearningVelocityTrend(sessions);

      // Calculate Optimal Study Duration from real session data
      const optimalStudyDuration = calculateOptimalStudyDuration(sessions);

      const result = {
        performancePrediction,
        comparativeMetrics,
        studyRecommendations,
        learningVelocityTrend,
        optimalStudyDuration
      } as AdvancedAnalytics;

      console.log('Advanced analytics calculated:', result);
      return result;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    advancedAnalytics: advancedAnalytics || {
      performancePrediction: {
        weeklyGoalLikelihood: 0,
        optimalStudyTimes: [],
        difficultyProgression: 'optimal' as const,
        burnoutRisk: 'low' as const,
        recommendedBreakFrequency: 25
      },
      comparativeMetrics: {
        performancePercentile: 50,
        averagePeerStudyTime: 0,
        streakComparison: 'average' as const,
        subjectRankings: []
      },
      studyRecommendations: [],
      learningVelocityTrend: 'stable' as const,
      optimalStudyDuration: 25
    },
    isLoading
  };
};

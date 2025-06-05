
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useProgressAnalytics } from "./useProgressAnalytics";
import { startOfMonth, endOfMonth, subMonths, format, differenceInDays } from 'date-fns';

export interface PerformancePrediction {
  weeklyGoalLikelihood: number;
  optimalStudyTimes: string[];
  difficultyProgression: 'too_easy' | 'optimal' | 'too_hard';
  burnoutRisk: 'low' | 'medium' | 'high';
  recommendedBreakFrequency: number; // minutes
}

export interface ComparativeMetrics {
  performancePercentile: number;
  averagePeerStudyTime: number;
  streakComparison: 'below_average' | 'average' | 'above_average';
  subjectRankings: { subject: string; percentile: number }[];
}

export interface StudyRecommendation {
  type: 'focus_subject' | 'increase_difficulty' | 'review_weak_areas' | 'take_break' | 'maintain_pace';
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  message: string;
  estimatedImpact: string;
}

export interface AdvancedAnalytics {
  performancePrediction: PerformancePrediction;
  comparativeMetrics: ComparativeMetrics;
  studyRecommendations: StudyRecommendation[];
  learningVelocityTrend: 'accelerating' | 'stable' | 'declining';
  optimalStudyDuration: number; // minutes
}

export const useAdvancedAnalytics = () => {
  const { user } = useAuth();
  const { overviewStats, gradeProgression, studyTimeAnalytics } = useProgressAnalytics();

  const { data: advancedAnalytics, isLoading } = useQuery({
    queryKey: ['advanced-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

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
          .gte('start_time', `${sixMonthsAgo}T00:00:00Z`),
        
        supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      // Calculate Performance Predictions
      const performancePrediction = calculatePerformancePrediction(
        historicalSessions.data || [],
        overviewStats,
        studyTimeAnalytics
      );

      // Calculate Comparative Metrics
      const comparativeMetrics = calculateComparativeMetrics(
        historicalSessions.data || [],
        allUsersComparison.data || [],
        gradeProgression
      );

      // Generate Study Recommendations
      const studyRecommendations = generateStudyRecommendations(
        overviewStats,
        gradeProgression,
        studyTimeAnalytics,
        performancePrediction,
        userGoals.data || []
      );

      // Calculate Learning Velocity Trend
      const learningVelocityTrend = calculateLearningVelocityTrend(historicalSessions.data || []);

      // Calculate Optimal Study Duration
      const optimalStudyDuration = calculateOptimalStudyDuration(historicalSessions.data || []);

      return {
        performancePrediction,
        comparativeMetrics,
        studyRecommendations,
        learningVelocityTrend,
        optimalStudyDuration
      } as AdvancedAnalytics;
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

// Helper Functions for Analytics Calculations

function calculatePerformancePrediction(sessions: any[], overviewStats: any, studyTimeAnalytics: any): PerformancePrediction {
  const recentSessions = sessions.slice(-14); // Last 2 weeks
  
  // Calculate weekly goal likelihood based on recent performance
  const avgDailyStudyTime = studyTimeAnalytics.weeklyComparison.thisWeek / 7;
  const weeklyGoalLikelihood = Math.min(95, Math.max(5, avgDailyStudyTime * 7 / 5 * 100)); // 5 hours goal

  // Determine optimal study times based on performance data
  const hourlyPerformance = recentSessions.reduce((acc: Record<number, number[]>, session) => {
    const hour = new Date(session.start_time).getHours();
    const efficiency = (session.cards_correct || 0) / Math.max(session.cards_reviewed || 1, 1);
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(efficiency);
    return acc;
  }, {});

  const optimalStudyTimes = Object.entries(hourlyPerformance)
    .map(([hour, efficiencies]) => ({
      hour: parseInt(hour),
      avgEfficiency: efficiencies.reduce((sum, eff) => sum + eff, 0) / efficiencies.length
    }))
    .sort((a, b) => b.avgEfficiency - a.avgEfficiency)
    .slice(0, 3)
    .map(({ hour }) => {
      if (hour >= 6 && hour < 12) return 'Morning (6-12 PM)';
      if (hour >= 12 && hour < 18) return 'Afternoon (12-6 PM)';
      return 'Evening (6-10 PM)';
    });

  // Calculate burnout risk based on study patterns
  const recentIntensity = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / (recentSessions.length || 1);
  const burnoutRisk = recentIntensity > 120 ? 'high' : recentIntensity > 60 ? 'medium' : 'low';

  return {
    weeklyGoalLikelihood,
    optimalStudyTimes: [...new Set(optimalStudyTimes)],
    difficultyProgression: 'optimal', // Simplified for now
    burnoutRisk,
    recommendedBreakFrequency: burnoutRisk === 'high' ? 15 : burnoutRisk === 'medium' ? 20 : 25
  };
}

function calculateComparativeMetrics(userSessions: any[], allSessions: any[], gradeProgression: any[]): ComparativeMetrics {
  const userTotalTime = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const userSessionCount = userSessions.length;

  // Group all sessions by user
  const userStats = allSessions.reduce((acc: Record<string, number>, session) => {
    if (!acc[session.user_id]) acc[session.user_id] = 0;
    acc[session.user_id] += session.duration || 0;
    return acc;
  }, {});

  const allUserTimes = Object.values(userStats).sort((a, b) => a - b);
  const userRank = allUserTimes.findIndex(time => time >= userTotalTime);
  const performancePercentile = Math.round((userRank / Math.max(allUserTimes.length, 1)) * 100);

  const averagePeerStudyTime = Math.round(
    allUserTimes.reduce((sum, time) => sum + time, 0) / Math.max(allUserTimes.length, 1) / 60
  );

  // Simplified streak comparison
  const streakComparison = performancePercentile > 75 ? 'above_average' : 
                          performancePercentile > 25 ? 'average' : 'below_average';

  // Subject rankings based on mastery levels
  const subjectRankings = gradeProgression.map(subject => ({
    subject: subject.subject,
    percentile: Math.min(95, Math.max(5, subject.masteryLevel))
  }));

  return {
    performancePercentile,
    averagePeerStudyTime,
    streakComparison,
    subjectRankings
  };
}

function generateStudyRecommendations(
  overviewStats: any,
  gradeProgression: any[],
  studyTimeAnalytics: any,
  performancePrediction: PerformancePrediction,
  goals: any[]
): StudyRecommendation[] {
  const recommendations: StudyRecommendation[] = [];

  // Check if user needs to focus on weak subjects
  const weakSubjects = gradeProgression.filter(subject => subject.masteryLevel < 60);
  if (weakSubjects.length > 0) {
    recommendations.push({
      type: 'focus_subject',
      subject: weakSubjects[0].subject,
      priority: 'high',
      message: `Focus on ${weakSubjects[0].subject} - currently at ${weakSubjects[0].masteryLevel}% mastery`,
      estimatedImpact: '+15% mastery in 2 weeks'
    });
  }

  // Check for burnout risk
  if (performancePrediction.burnoutRisk === 'high') {
    recommendations.push({
      type: 'take_break',
      priority: 'high',
      message: 'Consider taking a short break to avoid burnout',
      estimatedImpact: 'Maintain long-term consistency'
    });
  }

  // Check weekly goal progress
  if (performancePrediction.weeklyGoalLikelihood < 50) {
    recommendations.push({
      type: 'maintain_pace',
      priority: 'medium',
      message: 'Increase daily study time to meet weekly goals',
      estimatedImpact: `+${Math.ceil((5 - studyTimeAnalytics.weeklyComparison.thisWeek) / 7 * 60)} min/day needed`
    });
  }

  // Review weak areas recommendation
  const lowGradeSubjects = gradeProgression.filter(s => 
    s.gradeDistribution.find(g => g.grade === 'C')?.percentage > 40
  );
  if (lowGradeSubjects.length > 0) {
    recommendations.push({
      type: 'review_weak_areas',
      priority: 'medium',
      message: 'Review cards with grade C to improve overall performance',
      estimatedImpact: '+10% accuracy improvement'
    });
  }

  return recommendations.slice(0, 4); // Limit to top 4 recommendations
}

function calculateLearningVelocityTrend(sessions: any[]): 'accelerating' | 'stable' | 'declining' {
  if (sessions.length < 10) return 'stable';

  const recentSessions = sessions.slice(-7);
  const olderSessions = sessions.slice(-14, -7);

  const recentAvg = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length;
  const olderAvg = olderSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / Math.max(olderSessions.length, 1);

  const change = (recentAvg - olderAvg) / Math.max(olderAvg, 1);
  
  if (change > 0.1) return 'accelerating';
  if (change < -0.1) return 'declining';
  return 'stable';
}

function calculateOptimalStudyDuration(sessions: any[]): number {
  if (sessions.length === 0) return 25;

  const sessionDurations = sessions
    .map(s => s.duration || 0)
    .filter(d => d > 0 && d < 180); // Filter reasonable durations (3 hours max)

  if (sessionDurations.length === 0) return 25;

  // Calculate median duration as optimal
  const sorted = sessionDurations.sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  
  return Math.max(15, Math.min(60, median)); // Clamp between 15-60 minutes
}

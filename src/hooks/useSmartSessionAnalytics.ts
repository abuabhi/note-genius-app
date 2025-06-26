
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { addDays, format, parseISO, getHours, differenceInMinutes } from 'date-fns';

export interface SessionPerformanceData {
  timeSlotPerformance: Record<number, number>; // hour -> average rating
  subjectDifficulty: Record<string, number>; // subject -> difficulty score
  optimalSessionDurations: Record<string, number>; // subject -> optimal minutes
  completionRates: Record<number, number>; // hour -> completion rate
  focusPatterns: {
    bestHours: number[];
    worstHours: number[];
    averageAttentionSpan: number;
  };
  breakEffectiveness: {
    optimalBreakLength: number;
    sessionCountBeforeBreak: number;
  };
}

export const useSmartSessionAnalytics = () => {
  const { user } = useAuth();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['smart-session-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get session data from study_plan_sessions
      const { data: sessions, error } = await supabase
        .from('study_plan_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_date', format(addDays(new Date(), -90), 'yyyy-MM-dd')) // Last 90 days
        .order('scheduled_date', { ascending: false });

      if (error) throw error;

      // Get study session data for additional performance metrics
      const { data: studySessions, error: studyError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', addDays(new Date(), -90).toISOString())
        .order('start_time', { ascending: false });

      if (studyError) throw studyError;

      return analyzeSessionPerformance(sessions || [], studySessions || []);
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    analytics: analyticsData,
    isLoading,
  };
};

function analyzeSessionPerformance(sessions: any[], studySessions: any[]): SessionPerformanceData {
  const timeSlotPerformance: Record<number, number[]> = {};
  const subjectDifficulty: Record<string, number[]> = {};
  const sessionDurations: Record<string, number[]> = {};
  const completionData: Record<number, { completed: number; total: number }> = {};

  // Initialize hourly data
  for (let hour = 0; hour < 24; hour++) {
    timeSlotPerformance[hour] = [];
    completionData[hour] = { completed: 0, total: 0 };
  }

  // Analyze study plan sessions
  sessions.forEach(session => {
    const sessionHour = getHours(parseISO(`${session.scheduled_date}T${session.scheduled_start_time}`));
    const rating = session.performance_rating || 3; // Default to 3 if no rating
    const topic = session.topic || 'General';
    
    // Track time slot performance
    timeSlotPerformance[sessionHour].push(rating);
    
    // Track completion rates
    completionData[sessionHour].total++;
    if (session.status === 'completed') {
      completionData[sessionHour].completed++;
    }

    // Track subject difficulty (inverse of rating)
    if (!subjectDifficulty[topic]) {
      subjectDifficulty[topic] = [];
    }
    subjectDifficulty[topic].push(6 - rating); // Higher rating = lower difficulty

    // Track session durations
    if (session.duration_minutes) {
      if (!sessionDurations[topic]) {
        sessionDurations[topic] = [];
      }
      sessionDurations[topic].push(session.duration_minutes);
    }
  });

  // Analyze study sessions for additional insights
  let totalStudyTime = 0;
  let sessionCount = 0;
  
  studySessions.forEach(session => {
    if (session.duration) {
      totalStudyTime += session.duration;
      sessionCount++;
    }
  });

  // Calculate averages
  const timeSlotAvgs: Record<number, number> = {};
  const completionRates: Record<number, number> = {};
  
  for (let hour = 0; hour < 24; hour++) {
    timeSlotAvgs[hour] = timeSlotPerformance[hour].length > 0 
      ? timeSlotPerformance[hour].reduce((a, b) => a + b, 0) / timeSlotPerformance[hour].length
      : 0;
    
    completionRates[hour] = completionData[hour].total > 0
      ? completionData[hour].completed / completionData[hour].total
      : 0;
  }

  const subjectDifficultyAvgs: Record<string, number> = {};
  Object.keys(subjectDifficulty).forEach(subject => {
    subjectDifficultyAvgs[subject] = 
      subjectDifficulty[subject].reduce((a, b) => a + b, 0) / subjectDifficulty[subject].length;
  });

  const optimalDurations: Record<string, number> = {};
  Object.keys(sessionDurations).forEach(subject => {
    optimalDurations[subject] = 
      Math.round(sessionDurations[subject].reduce((a, b) => a + b, 0) / sessionDurations[subject].length);
  });

  // Find best and worst performing hours
  const hourPerformance = Object.entries(timeSlotAvgs)
    .filter(([_, rating]) => rating > 0)
    .sort(([, a], [, b]) => b - a);

  const bestHours = hourPerformance.slice(0, 3).map(([hour]) => parseInt(hour));
  const worstHours = hourPerformance.slice(-3).map(([hour]) => parseInt(hour));

  return {
    timeSlotPerformance: timeSlotAvgs,
    subjectDifficulty: subjectDifficultyAvgs,
    optimalSessionDurations: optimalDurations,
    completionRates,
    focusPatterns: {
      bestHours,
      worstHours,
      averageAttentionSpan: sessionCount > 0 ? Math.round(totalStudyTime / sessionCount) : 30,
    },
    breakEffectiveness: {
      optimalBreakLength: 15, // Default, could be calculated from data
      sessionCountBeforeBreak: 3, // Default, could be calculated from data
    },
  };
}

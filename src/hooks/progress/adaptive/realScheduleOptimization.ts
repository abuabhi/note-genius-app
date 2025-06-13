
import { useMemo } from 'react';
import { useSessionAnalytics } from '../../useSessionAnalytics';

export interface OptimalTimeSlot {
  startTime: string;
  endTime: string;
  efficiencyScore: number;
  recommendedSubjects: string[];
  cognitiveLoad: 'low' | 'medium' | 'high';
}

export interface ScheduleOptimization {
  optimalTimeSlots: OptimalTimeSlot[];
  weeklyStudyPlan: {
    totalHours: number;
    sessionsPerWeek: number;
    averageSessionDuration: number;
  };
  personalizedTips: string[];
}

export const useRealScheduleOptimization = () => {
  const { analytics, sessions } = useSessionAnalytics();

  const scheduleOptimization = useMemo((): ScheduleOptimization => {
    if (!sessions || sessions.length === 0) {
      return {
        optimalTimeSlots: [
          {
            startTime: '09:00',
            endTime: '10:00',
            efficiencyScore: 80,
            recommendedSubjects: ['General Study'],
            cognitiveLoad: 'medium'
          }
        ],
        weeklyStudyPlan: {
          totalHours: 5,
          sessionsPerWeek: 7,
          averageSessionDuration: 30
        },
        personalizedTips: ['Start with regular 30-minute sessions']
      };
    }

    // Analyze session patterns by hour
    const hourlyPerformance = new Map<number, { sessionCount: number; totalAccuracy: number; totalDuration: number; subjects: Set<string> }>();
    
    sessions.forEach(session => {
      const hour = new Date(session.start_time).getHours();
      const accuracy = session.cards_correct && session.cards_reviewed 
        ? (session.cards_correct / session.cards_reviewed) * 100 
        : 0;
      
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, {
          sessionCount: 0,
          totalAccuracy: 0,
          totalDuration: 0,
          subjects: new Set()
        });
      }
      
      const stats = hourlyPerformance.get(hour)!;
      stats.sessionCount++;
      stats.totalAccuracy += accuracy;
      stats.totalDuration += session.duration || 0;
      if (session.subject) {
        stats.subjects.add(session.subject);
      }
    });

    // Generate optimal time slots
    const optimalTimeSlots: OptimalTimeSlot[] = Array.from(hourlyPerformance.entries())
      .filter(([hour, stats]) => stats.sessionCount >= 2)
      .map(([hour, stats]) => ({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        efficiencyScore: Math.round(stats.totalAccuracy / stats.sessionCount),
        recommendedSubjects: Array.from(stats.subjects),
        cognitiveLoad: stats.totalDuration / stats.sessionCount > 45 ? 'high' : 
                      stats.totalDuration / stats.sessionCount > 30 ? 'medium' : 'low'
      }))
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
      .slice(0, 3);

    // Generate weekly study plan
    const weeklyStudyPlan = {
      totalHours: Math.round(analytics.totalStudyTime || 5),
      sessionsPerWeek: Math.min(Math.max(analytics.totalSessions, 3), 14),
      averageSessionDuration: analytics.averageSessionTime || 30
    };

    // Generate personalized tips
    const personalizedTips: string[] = [];
    const mostProductiveHour = optimalTimeSlots[0];
    if (mostProductiveHour) {
      personalizedTips.push(`Your most productive time is around ${mostProductiveHour.startTime}`);
    }
    
    if (analytics.averageSessionTime > 45) {
      personalizedTips.push('Consider breaking long sessions into shorter focused periods');
    }
    
    if (analytics.totalSessions < 10) {
      personalizedTips.push('Build consistency with daily short sessions');
    }

    return {
      optimalTimeSlots,
      weeklyStudyPlan,
      personalizedTips
    };
  }, [analytics, sessions]);

  return {
    scheduleOptimization
  };
};

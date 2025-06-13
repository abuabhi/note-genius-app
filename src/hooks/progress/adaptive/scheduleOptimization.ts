
import { useSessionAnalytics } from '../../../hooks/useSessionAnalytics';

export interface OptimalTimeSlot {
  startTime: string;
  endTime: string;
  efficiencyScore: number;
  recommendedSubjects: string[];
  cognitiveLoad: 'low' | 'medium' | 'high';
}

export const useScheduleOptimization = () => {
  const { analytics, sessions } = useSessionAnalytics();

  const calculateOptimalTimeSlots = (): OptimalTimeSlot[] => {
    if (!sessions || sessions.length === 0) {
      return [
        {
          startTime: '09:00',
          endTime: '10:00',
          efficiencyScore: 75,
          recommendedSubjects: ['General Study'],
          cognitiveLoad: 'medium'
        }
      ];
    }

    // Analyze performance by hour
    const hourlyStats = new Map();
    
    sessions.forEach(session => {
      const hour = new Date(session.start_time).getHours();
      const accuracy = session.cards_correct && session.cards_reviewed 
        ? (session.cards_correct / session.cards_reviewed) * 100 
        : 0;
      
      if (!hourlyStats.has(hour)) {
        hourlyStats.set(hour, {
          totalAccuracy: 0,
          sessionCount: 0,
          subjects: new Set()
        });
      }
      
      const stats = hourlyStats.get(hour);
      stats.totalAccuracy += accuracy;
      stats.sessionCount++;
      if (session.subject) {
        stats.subjects.add(session.subject);
      }
    });

    return Array.from(hourlyStats.entries())
      .filter(([hour, stats]) => stats.sessionCount >= 2)
      .map(([hour, stats]) => ({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        efficiencyScore: Math.round(stats.totalAccuracy / stats.sessionCount),
        recommendedSubjects: Array.from(stats.subjects),
        cognitiveLoad: stats.sessionCount > 3 ? 'low' : 'medium'
      }))
      .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
      .slice(0, 5);
  };

  return {
    calculateOptimalTimeSlots
  };
};

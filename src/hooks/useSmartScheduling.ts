
import { useMemo } from 'react';
import { useSmartSessionAnalytics } from './useSmartSessionAnalytics';
import { StudyPlan, StudyPlanSession } from '@/types/studyPlanner';
import { addDays, addMinutes, format, setHours, setMinutes } from 'date-fns';

export interface SchedulingRecommendation {
  sessionId?: string;
  recommendedDate: string;
  recommendedStartTime: string;
  recommendedEndTime: string;
  confidence: number; // 0-1 scale
  reasoning: string[];
  originalDate?: string;
  originalStartTime?: string;
}

export interface ScheduleOptimization {
  recommendations: SchedulingRecommendation[];
  overallScore: number;
  improvements: string[];
}

export const useSmartScheduling = () => {
  const { analytics, isLoading } = useSmartSessionAnalytics();

  const generateRecommendations = useMemo(() => {
    return (plan: StudyPlan, existingSessions: StudyPlanSession[]): ScheduleOptimization => {
      if (!analytics) {
        return {
          recommendations: [],
          overallScore: 0,
          improvements: ['Analytics data not available yet. Generate more sessions to get personalized recommendations.'],
        };
      }

      const recommendations: SchedulingRecommendation[] = [];
      const improvements: string[] = [];

      // Analyze each session for optimization opportunities
      existingSessions.forEach(session => {
        if (session.status === 'scheduled') {
          const sessionHour = parseInt(session.scheduled_start_time.split(':')[0]);
          const currentPerformance = analytics.timeSlotPerformance[sessionHour] || 0;
          const currentCompletion = analytics.completionRates[sessionHour] || 0;
          
          // Find better time slots
          const betterHours = analytics.focusPatterns.bestHours.filter(hour => 
            analytics.timeSlotPerformance[hour] > currentPerformance + 0.5
          );

          if (betterHours.length > 0 && currentPerformance < 3.5) {
            const bestHour = betterHours[0];
            const newDate = session.scheduled_date;
            const newStartTime = `${bestHour.toString().padStart(2, '0')}:00:00`;
            const endTime = addMinutes(
              setMinutes(setHours(new Date(), bestHour), 0), 
              session.duration_minutes
            );
            const newEndTime = format(endTime, 'HH:mm:ss');
            
            recommendations.push({
              sessionId: session.id,
              recommendedDate: newDate,
              recommendedStartTime: newStartTime,
              recommendedEndTime: newEndTime,
              confidence: Math.min(0.9, (analytics.timeSlotPerformance[bestHour] - currentPerformance) / 2),
              reasoning: [
                `Current time slot (${sessionHour}:00) has low performance rating: ${currentPerformance.toFixed(1)}/5`,
                `Recommended time (${bestHour}:00) shows ${analytics.timeSlotPerformance[bestHour].toFixed(1)}/5 performance`,
                `${Math.round(analytics.completionRates[bestHour] * 100)}% completion rate at recommended time`,
              ],
              originalDate: session.scheduled_date,
              originalStartTime: session.scheduled_start_time,
            });
          }

          // Check session duration optimization
          const topic = session.topic || session.title;
          const optimalDuration = analytics.optimalSessionDurations[topic];
          if (optimalDuration && Math.abs(session.duration_minutes - optimalDuration) > 15) {
            const newEndTime = addMinutes(
              setMinutes(setHours(new Date(), sessionHour), parseInt(session.scheduled_start_time.split(':')[1])), 
              optimalDuration
            );
            
            recommendations.push({
              sessionId: session.id,
              recommendedDate: session.scheduled_date,
              recommendedStartTime: session.scheduled_start_time,
              recommendedEndTime: format(newEndTime, 'HH:mm:ss'),
              confidence: 0.7,
              reasoning: [
                `Current duration: ${session.duration_minutes} minutes`,
                `Optimal duration for ${topic}: ${optimalDuration} minutes`,
                `Based on your historical performance data`,
              ],
              originalDate: session.scheduled_date,
              originalStartTime: session.scheduled_start_time,
            });
          }
        }
      });

      // Generate general improvements
      if (analytics.focusPatterns.bestHours.length > 0) {
        improvements.push(
          `Your best performance hours are: ${analytics.focusPatterns.bestHours.map(h => `${h}:00`).join(', ')}`
        );
      }

      if (analytics.focusPatterns.averageAttentionSpan > 0) {
        improvements.push(
          `Your average attention span is ${analytics.focusPatterns.averageAttentionSpan} minutes`
        );
      }

      const overallScore = calculateScheduleScore(existingSessions, analytics);

      return {
        recommendations: recommendations.sort((a, b) => b.confidence - a.confidence),
        overallScore,
        improvements,
      };
    };
  }, [analytics]);

  const generateOptimalSchedule = useMemo(() => {
    return (plan: StudyPlan): StudyPlanSession[] => {
      if (!analytics) return [];

      const sessions: Partial<StudyPlanSession>[] = [];
      const startDate = new Date(plan.start_date);
      const endDate = new Date(plan.end_date);
      let currentDate = startDate;

      let topicIndex = 0;
      const bestHours = analytics.focusPatterns.bestHours.length > 0 
        ? analytics.focusPatterns.bestHours 
        : [9, 14, 16]; // Default good hours

      while (currentDate <= endDate && topicIndex < plan.topics.length) {
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        if (plan.available_days.includes(dayName)) {
          const topic = plan.topics[topicIndex];
          const optimalDuration = analytics.optimalSessionDurations[topic.name] || plan.preferred_session_duration;
          const bestHour = bestHours[topicIndex % bestHours.length];
          
          const startTime = `${bestHour.toString().padStart(2, '0')}:00:00`;
          const endTime = format(
            addMinutes(setMinutes(setHours(new Date(), bestHour), 0), optimalDuration),
            'HH:mm:ss'
          );

          sessions.push({
            study_plan_id: plan.id,
            title: `Optimized Study: ${topic.name}`,
            topic: topic.name,
            scheduled_date: format(currentDate, 'yyyy-MM-dd'),
            scheduled_start_time: startTime,
            scheduled_end_time: endTime,
            duration_minutes: optimalDuration,
            session_type: 'study',
            priority: topic.priority,
            status: 'scheduled',
          });

          topicIndex++;
        }

        currentDate = addDays(currentDate, 1);
      }

      return sessions as StudyPlanSession[];
    };
  }, [analytics]);

  return {
    generateRecommendations,
    generateOptimalSchedule,
    analytics,
    isLoading,
  };
};

function calculateScheduleScore(sessions: StudyPlanSession[], analytics: any): number {
  if (sessions.length === 0) return 0;

  let totalScore = 0;
  let scoredSessions = 0;

  sessions.forEach(session => {
    const sessionHour = parseInt(session.scheduled_start_time.split(':')[0]);
    const timeSlotScore = analytics.timeSlotPerformance[sessionHour] || 2.5;
    const completionRate = analytics.completionRates[sessionHour] || 0.5;
    
    // Combined score based on performance and completion rate
    const sessionScore = (timeSlotScore / 5) * 0.6 + completionRate * 0.4;
    totalScore += sessionScore;
    scoredSessions++;
  });

  return scoredSessions > 0 ? Math.round((totalScore / scoredSessions) * 100) : 0;
}

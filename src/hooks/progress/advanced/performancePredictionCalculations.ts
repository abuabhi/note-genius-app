
import { StudySession, PerformancePrediction } from './types';

export function calculatePerformancePrediction(
  sessions: StudySession[],
  overviewStats: any,
  studyTimeAnalytics: any
): PerformancePrediction {
  const recentSessions = sessions.slice(0, 10);
  const totalSessions = sessions.length;
  
  // Calculate weekly goal likelihood
  const currentWeeklyTime = studyTimeAnalytics?.weeklyComparison?.thisWeek || 0;
  const targetWeeklyTime = 5; // hours
  const weeklyGoalLikelihood = Math.min((currentWeeklyTime / targetWeeklyTime) * 100, 100);

  // Determine optimal study times based on session performance
  const sessionsByHour = new Map<number, { count: number; avgPerformance: number }>();
  
  recentSessions.forEach(session => {
    const hour = new Date(session.start_time).getHours();
    const performance = session.cards_reviewed > 0 ? 
      (session.cards_correct / session.cards_reviewed) : 0;
    
    if (!sessionsByHour.has(hour)) {
      sessionsByHour.set(hour, { count: 0, avgPerformance: 0 });
    }
    
    const existing = sessionsByHour.get(hour)!;
    existing.avgPerformance = (existing.avgPerformance * existing.count + performance) / (existing.count + 1);
    existing.count++;
  });

  const optimalStudyTimes = Array.from(sessionsByHour.entries())
    .filter(([_, data]) => data.count >= 2)
    .sort(([_, a], [__, b]) => b.avgPerformance - a.avgPerformance)
    .slice(0, 3)
    .map(([hour]) => `${hour}:00`);

  // Assess difficulty progression
  const recentPerformance = recentSessions.slice(0, 5).reduce((acc, session) => {
    return acc + (session.cards_reviewed > 0 ? session.cards_correct / session.cards_reviewed : 0);
  }, 0) / Math.min(recentSessions.length, 5);

  let difficultyProgression: 'too_easy' | 'optimal' | 'too_hard' = 'optimal';
  if (recentPerformance > 0.9) difficultyProgression = 'too_easy';
  else if (recentPerformance < 0.6) difficultyProgression = 'too_hard';

  // Calculate burnout risk
  const recentSessionDurations = recentSessions.map(s => s.duration || 0);
  const avgDuration = recentSessionDurations.reduce((a, b) => a + b, 0) / recentSessionDurations.length;
  const longSessions = recentSessionDurations.filter(d => d > 7200).length; // > 2 hours
  
  let burnoutRisk: 'low' | 'medium' | 'high' = 'low';
  if (longSessions > 3 || avgDuration > 5400) burnoutRisk = 'high';
  else if (longSessions > 1 || avgDuration > 3600) burnoutRisk = 'medium';

  // Recommend break frequency
  const recommendedBreakFrequency = burnoutRisk === 'high' ? 20 : 
                                   burnoutRisk === 'medium' ? 25 : 30;

  return {
    weeklyGoalLikelihood,
    optimalStudyTimes,
    difficultyProgression,
    burnoutRisk,
    recommendedBreakFrequency
  };
}

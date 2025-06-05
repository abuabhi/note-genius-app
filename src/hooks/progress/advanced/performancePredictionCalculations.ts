
import { PerformancePrediction, StudySession } from './types';

export function calculatePerformancePrediction(
  sessions: StudySession[], 
  overviewStats: any, 
  studyTimeAnalytics: any
): PerformancePrediction {
  const recentSessions = sessions.slice(-14); // Last 2 weeks
  
  // Calculate weekly goal likelihood based on recent performance
  const avgDailyStudyTime = (studyTimeAnalytics?.weeklyComparison?.thisWeek || 0) / 7;
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
  const recentIntensity = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / Math.max(recentSessions.length, 1);
  const burnoutRisk = recentIntensity > 120 ? 'high' : recentIntensity > 60 ? 'medium' : 'low';

  return {
    weeklyGoalLikelihood,
    optimalStudyTimes: [...new Set(optimalStudyTimes)],
    difficultyProgression: 'optimal', // Simplified for now
    burnoutRisk,
    recommendedBreakFrequency: burnoutRisk === 'high' ? 15 : burnoutRisk === 'medium' ? 20 : 25
  };
}

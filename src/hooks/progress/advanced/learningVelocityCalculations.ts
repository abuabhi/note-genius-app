
import { StudySession } from './types';

export function calculateLearningVelocityTrend(sessions: StudySession[]): 'improving' | 'stable' | 'declining' {
  if (sessions.length < 4) return 'stable';

  const recentSessions = sessions.slice(0, 6);
  const olderSessions = sessions.slice(6, 12);

  const recentPerformance = calculateAveragePerformance(recentSessions);
  const olderPerformance = calculateAveragePerformance(olderSessions);

  const improvementThreshold = 0.1;

  if (recentPerformance > olderPerformance + improvementThreshold) {
    return 'improving';
  } else if (recentPerformance < olderPerformance - improvementThreshold) {
    return 'declining';
  }
  
  return 'stable';
}

export function calculateOptimalStudyDuration(sessions: StudySession[]): number {
  if (sessions.length === 0) return 25;

  // Group sessions by duration ranges and calculate performance
  const durationRanges = new Map<string, { count: number; totalPerformance: number }>();
  
  sessions.forEach(session => {
    const duration = session.duration || 0;
    const durationMinutes = Math.floor(duration / 60);
    const performance = session.cards_reviewed > 0 ? 
      session.cards_correct / session.cards_reviewed : 0;

    let range: string;
    if (durationMinutes <= 15) range = '15';
    else if (durationMinutes <= 25) range = '25';
    else if (durationMinutes <= 45) range = '45';
    else if (durationMinutes <= 60) range = '60';
    else range = '90';

    if (!durationRanges.has(range)) {
      durationRanges.set(range, { count: 0, totalPerformance: 0 });
    }

    const existing = durationRanges.get(range)!;
    existing.count++;
    existing.totalPerformance += performance;
  });

  // Find the duration range with the best average performance
  let bestDuration = 25;
  let bestPerformance = 0;

  durationRanges.forEach((data, duration) => {
    if (data.count >= 2) { // Need at least 2 sessions for reliability
      const avgPerformance = data.totalPerformance / data.count;
      if (avgPerformance > bestPerformance) {
        bestPerformance = avgPerformance;
        bestDuration = parseInt(duration);
      }
    }
  });

  return bestDuration;
}

function calculateAveragePerformance(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  
  const totalPerformance = sessions.reduce((acc, session) => {
    return acc + (session.cards_reviewed > 0 ? session.cards_correct / session.cards_reviewed : 0);
  }, 0);
  
  return totalPerformance / sessions.length;
}

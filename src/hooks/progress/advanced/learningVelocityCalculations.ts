
import { StudySession } from './types';

export function calculateLearningVelocityTrend(sessions: StudySession[]): 'accelerating' | 'stable' | 'declining' {
  if (sessions.length < 10) return 'stable';

  const recentSessions = sessions.slice(-7);
  const olderSessions = sessions.slice(-14, -7);

  const recentAvg = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / Math.max(recentSessions.length, 1);
  const olderAvg = olderSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / Math.max(olderSessions.length, 1);

  const change = (recentAvg - olderAvg) / Math.max(olderAvg, 1);
  
  if (change > 0.1) return 'accelerating';
  if (change < -0.1) return 'declining';
  return 'stable';
}

export function calculateOptimalStudyDuration(sessions: StudySession[]): number {
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

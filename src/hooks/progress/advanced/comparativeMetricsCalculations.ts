
import { ComparativeMetrics, StudySession } from './types';

export function calculateComparativeMetrics(
  userSessions: StudySession[], 
  allSessions: Array<{ user_id: string; duration: number }>, 
  gradeProgression: any[]
): ComparativeMetrics {
  const userTotalTime = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

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
  const subjectRankings = (gradeProgression || []).map(subject => ({
    subject: subject.subject || 'Unknown',
    percentile: Math.min(95, Math.max(5, subject.masteryLevel || 0))
  }));

  return {
    performancePercentile,
    averagePeerStudyTime,
    streakComparison,
    subjectRankings
  };
}

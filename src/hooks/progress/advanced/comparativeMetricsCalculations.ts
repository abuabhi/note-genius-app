
import { StudySession, ComparativeMetrics } from './types';

export function calculateComparativeMetrics(
  userSessions: StudySession[],
  allUserSessions: Array<{ user_id: string; duration: number }>,
  gradeProgression: any[]
): ComparativeMetrics {
  // Calculate user's average study time
  const userTotalTime = userSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
  const userAvgTime = userTotalTime / Math.max(userSessions.length, 1);

  // Calculate peer average (exclude current user if possible)
  const peerSessions = allUserSessions.filter(s => s.duration > 0 && s.duration < 14400); // Valid sessions
  const peerTotalTime = peerSessions.reduce((acc, session) => acc + session.duration, 0);
  const averagePeerStudyTime = peerTotalTime / Math.max(peerSessions.length, 1);

  // Calculate performance percentile
  const userPerformanceScore = calculateUserPerformanceScore(userSessions, gradeProgression);
  const performancePercentile = Math.min(Math.max(userPerformanceScore * 20 + 50, 10), 90);

  // Calculate streak comparison
  const userStreak = calculateCurrentStreak(userSessions);
  let streakComparison: 'below_average' | 'average' | 'above_average' = 'average';
  
  if (userStreak >= 7) streakComparison = 'above_average';
  else if (userStreak <= 2) streakComparison = 'below_average';

  // Subject rankings based on performance
  const subjectRankings = gradeProgression.map(subject => ({
    subject: subject.subject,
    rank: calculateSubjectRank(subject),
    percentile: Math.min(Math.max(subject.masteryLevel || 0, 10), 90)
  })).sort((a, b) => b.percentile - a.percentile);

  return {
    performancePercentile,
    averagePeerStudyTime: averagePeerStudyTime / 60, // Convert to minutes
    streakComparison,
    subjectRankings
  };
}

function calculateUserPerformanceScore(sessions: StudySession[], gradeProgression: any[]): number {
  const sessionScore = sessions.reduce((acc, session) => {
    const accuracy = session.cards_reviewed > 0 ? session.cards_correct / session.cards_reviewed : 0;
    return acc + accuracy;
  }, 0) / Math.max(sessions.length, 1);

  const gradeScore = gradeProgression.reduce((acc, subject) => {
    return acc + (subject.masteryLevel || 0) / 100;
  }, 0) / Math.max(gradeProgression.length, 1);

  return (sessionScore + gradeScore) / 2;
}

function calculateCurrentStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  
  const dates = sessions
    .map(s => new Date(s.start_time).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date().toDateString();
  
  for (let i = 0; i < dates.length; i++) {
    const date = new Date(dates[i]);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (date.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateSubjectRank(subject: any): number {
  const masteryLevel = subject.masteryLevel || 0;
  if (masteryLevel >= 90) return 1;
  if (masteryLevel >= 80) return 2;
  if (masteryLevel >= 70) return 3;
  if (masteryLevel >= 60) return 4;
  return 5;
}

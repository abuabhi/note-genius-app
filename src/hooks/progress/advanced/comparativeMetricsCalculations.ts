
import { ComparativeMetrics, StudySession } from './types';

export function calculateComparativeMetrics(
  userSessions: StudySession[], 
  allSessions: Array<{ user_id: string; duration: number }>, 
  gradeProgression: any[]
): ComparativeMetrics {
  console.log('Calculating comparative metrics with real data');
  console.log('User sessions:', userSessions.length);
  console.log('All sessions for comparison:', allSessions.length);

  // Calculate user's total study time in minutes
  const userTotalTimeMinutes = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  
  // Return default values if insufficient data
  if (allSessions.length < 10) {
    console.log('Insufficient comparison data, returning defaults');
    return {
      performancePercentile: 50,
      averagePeerStudyTime: 0,
      streakComparison: 'average' as const,
      subjectRankings: []
    };
  }

  // Group all sessions by user and calculate total time per user
  const userStats = allSessions.reduce((acc: Record<string, number>, session) => {
    if (!acc[session.user_id]) acc[session.user_id] = 0;
    acc[session.user_id] += session.duration || 0;
    return acc;
  }, {});

  const allUserTimes = Object.values(userStats).filter(time => time > 0).sort((a, b) => a - b);
  
  // Calculate percentile ranking
  let performancePercentile = 50; // Default to average
  if (allUserTimes.length > 0) {
    const userRank = allUserTimes.findIndex(time => time >= userTotalTimeMinutes);
    if (userRank !== -1) {
      performancePercentile = Math.round((userRank / allUserTimes.length) * 100);
    } else if (userTotalTimeMinutes > 0) {
      // User has more time than anyone else
      performancePercentile = 100;
    }
  }

  // Calculate average peer study time (convert to hours)
  const averagePeerStudyTime = allUserTimes.length > 0 
    ? Math.round(allUserTimes.reduce((sum, time) => sum + time, 0) / allUserTimes.length / 60)
    : 0;

  // Calculate streak comparison based on session frequency
  let streakComparison: 'above_average' | 'average' | 'below_average' = 'average';
  
  if (userSessions.length > 0) {
    // Calculate user's average sessions per week
    const userSessionDays = new Set(
      userSessions.map(s => new Date(s.start_time).toDateString())
    ).size;
    
    // Simple heuristic: more than 4 unique study days = above average
    if (userSessionDays >= 5) {
      streakComparison = 'above_average';
    } else if (userSessionDays <= 2) {
      streakComparison = 'below_average';
    }
  }

  // Subject rankings based on real flashcard progress data
  const subjectRankings = (gradeProgression || [])
    .filter(subject => subject.subject && subject.masteryLevel)
    .map(subject => ({
      subject: subject.subject,
      percentile: Math.min(95, Math.max(5, Math.round(subject.masteryLevel * 20))) // Convert mastery level to percentile
    }))
    .slice(0, 5); // Limit to top 5 subjects

  const result = {
    performancePercentile,
    averagePeerStudyTime,
    streakComparison,
    subjectRankings
  };

  console.log('Calculated comparative metrics:', result);
  return result;
}

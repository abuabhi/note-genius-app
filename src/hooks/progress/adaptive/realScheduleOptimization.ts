
import { EnhancedStudySession } from '../../useEnhancedStudySessions';
import { StudySchedule, ScheduleSlot, OptimalTimeSlot, BreakRecommendation } from './types';

export function generateRealOptimalSchedule(
  userSessions: EnhancedStudySession[],
  flashcardSets: any[]
): StudySchedule {
  console.log('🔄 Generating real optimal schedule from', userSessions.length, 'sessions');

  const optimalTimes = calculateRealOptimalTimes(userSessions);
  const weeklyPattern = generateRealWeeklyPattern(userSessions);
  const adaptiveBreaks = generatePersonalizedBreaks(userSessions);

  return {
    userId: 'current_user',
    weeklyPattern,
    optimizedTimes: optimalTimes,
    adaptiveBreaks,
    preferences: {
      preferredStudyDuration: calculatePreferredDuration(userSessions),
      maxDailyStudyTime: 180,
      preferredDifficulty: 'adaptive',
      breakFrequency: 'moderate',
      studyStyle: 'distributed'
    },
    lastUpdated: new Date().toISOString()
  };
}

function calculateRealOptimalTimes(sessions: EnhancedStudySession[]): OptimalTimeSlot[] {
  if (sessions.length < 3) {
    // Default optimal times for new users
    return [
      {
        startTime: '09:00',
        endTime: '10:00',
        efficiencyScore: 0.75,
        recommendedSubjects: ['Start with any subject'],
        cognitiveLoad: 'medium'
      },
      {
        startTime: '15:00',
        endTime: '16:00',
        efficiencyScore: 0.70,
        recommendedSubjects: ['Review material'],
        cognitiveLoad: 'medium'
      }
    ];
  }

  // Analyze performance by hour
  const hourlyPerformance = sessions.reduce((acc, session) => {
    const hour = new Date(session.start_time).getHours();
    const accuracy = session.cards_reviewed && session.cards_reviewed > 0 ? 
      (session.cards_correct || 0) / session.cards_reviewed : 0;
    
    if (!acc[hour]) {
      acc[hour] = { 
        totalAccuracy: 0, 
        sessionCount: 0, 
        totalDuration: 0,
        subjects: new Set() 
      };
    }
    
    acc[hour].totalAccuracy += accuracy;
    acc[hour].sessionCount += 1;
    acc[hour].totalDuration += (session.duration || 0);
    
    if (session.subject) acc[hour].subjects.add(session.subject);
    
    return acc;
  }, {} as Record<number, { 
    totalAccuracy: number; 
    sessionCount: number; 
    totalDuration: number;
    subjects: Set<string> 
  }>);

  // Get top 3 performing hours
  const topHours = Object.entries(hourlyPerformance)
    .filter(([, data]) => data.sessionCount >= 2) // Need at least 2 sessions
    .sort(([, a], [, b]) => (b.totalAccuracy / b.sessionCount) - (a.totalAccuracy / a.sessionCount))
    .slice(0, 3);

  return topHours.map(([hour, data]) => {
    const avgAccuracy = data.totalAccuracy / data.sessionCount;
    const avgDuration = data.totalDuration / data.sessionCount;
    const endHour = parseInt(hour) + Math.ceil(avgDuration / 3600);
    
    return {
      startTime: `${hour.padStart(2, '0')}:00`,
      endTime: `${endHour.toString().padStart(2, '0')}:00`,
      efficiencyScore: Math.min(0.95, avgAccuracy * 1.1),
      recommendedSubjects: Array.from(data.subjects).slice(0, 3),
      cognitiveLoad: getCognitiveLoadForHour(parseInt(hour))
    };
  });
}

function generateRealWeeklyPattern(sessions: EnhancedStudySession[]): ScheduleSlot[] {
  const pattern: ScheduleSlot[] = [];
  
  // Analyze study patterns by day of week
  const dayPatterns = sessions.reduce((acc, session) => {
    const dayOfWeek = new Date(session.start_time).getDay();
    const hour = new Date(session.start_time).getHours();
    const duration = session.duration || 1800; // Default 30 min
    
    if (!acc[dayOfWeek]) acc[dayOfWeek] = [];
    acc[dayOfWeek].push({ hour, duration });
    
    return acc;
  }, {} as Record<number, { hour: number; duration: number }[]>);

  // Generate realistic weekly pattern
  for (let day = 0; day < 7; day++) {
    const dayData = dayPatterns[day];
    
    if (dayData && dayData.length > 0) {
      // Use actual user patterns
      const avgHour = Math.round(dayData.reduce((sum, d) => sum + d.hour, 0) / dayData.length);
      const avgDuration = Math.round(dayData.reduce((sum, d) => sum + d.duration, 0) / dayData.length);
      const endHour = avgHour + Math.ceil(avgDuration / 3600);
      
      pattern.push({
        dayOfWeek: day,
        startTime: `${avgHour.toString().padStart(2, '0')}:00`,
        endTime: `${endHour.toString().padStart(2, '0')}:00`,
        intensity: getIntensityForTime(avgHour),
        isFlexible: true
      });
    } else {
      // Create recommendations for days without data
      const recommendedHour = getRecommendedHourForDay(day);
      pattern.push({
        dayOfWeek: day,
        startTime: `${recommendedHour.toString().padStart(2, '0')}:00`,
        endTime: `${(recommendedHour + 1).toString().padStart(2, '0')}:00`,
        intensity: 'moderate',
        isFlexible: true
      });
    }
  }

  return pattern;
}

function generatePersonalizedBreaks(sessions: EnhancedStudySession[]): BreakRecommendation[] {
  const avgSessionLength = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length
    : 1800; // Default 30 minutes

  const recommendations: BreakRecommendation[] = [];

  if (avgSessionLength > 2700) { // > 45 minutes
    recommendations.push(
      { 
        afterMinutes: 25, 
        durationMinutes: 5, 
        breakType: 'short', 
        suggestedActivity: 'Deep breathing or eye rest' 
      },
      { 
        afterMinutes: 50, 
        durationMinutes: 15, 
        breakType: 'medium', 
        suggestedActivity: 'Walk or light stretching' 
      }
    );
  } else if (avgSessionLength > 1800) { // > 30 minutes
    recommendations.push(
      { 
        afterMinutes: 30, 
        durationMinutes: 10, 
        breakType: 'medium', 
        suggestedActivity: 'Hydration and movement' 
      }
    );
  } else {
    recommendations.push(
      { 
        afterMinutes: Math.round(avgSessionLength / 60), 
        durationMinutes: 5, 
        breakType: 'short', 
        suggestedActivity: 'Quick refresh break' 
      }
    );
  }

  return recommendations;
}

function calculatePreferredDuration(sessions: EnhancedStudySession[]): number {
  if (sessions.length === 0) return 45; // Default 45 minutes

  const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
  return Math.round(avgDuration / 60); // Convert to minutes
}

function getCognitiveLoadForHour(hour: number): 'low' | 'medium' | 'high' {
  if (hour >= 9 && hour <= 11) return 'high'; // Peak morning
  if (hour >= 14 && hour <= 16) return 'medium'; // Afternoon
  if (hour >= 19 && hour <= 21) return 'medium'; // Evening
  return 'low'; // Early morning, late night
}

function getIntensityForTime(hour: number): 'light' | 'moderate' | 'intensive' {
  if (hour >= 9 && hour <= 11) return 'intensive';
  if (hour >= 14 && hour <= 17) return 'moderate';
  return 'light';
}

function getRecommendedHourForDay(dayOfWeek: number): number {
  // Weekend vs weekday recommendations
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 10; // 10 AM on weekends
  }
  return 19; // 7 PM on weekdays
}

export function getTodaysScheduleRecommendations(
  schedule: StudySchedule,
  currentHour: number = new Date().getHours()
): {
  currentRecommendation: string;
  nextOptimalTime: string;
  todaysSlots: ScheduleSlot[];
} {
  const today = new Date().getDay();
  const todaysSlots = schedule.weeklyPattern.filter(slot => slot.dayOfWeek === today);
  
  // Find next optimal time
  const upcomingSlots = schedule.optimizedTimes.filter(slot => {
    const slotHour = parseInt(slot.startTime.split(':')[0]);
    return slotHour > currentHour;
  });

  const nextOptimalTime = upcomingSlots.length > 0 
    ? upcomingSlots[0].startTime
    : schedule.optimizedTimes[0]?.startTime || '09:00';

  // Current recommendation
  const currentOptimal = schedule.optimizedTimes.find(slot => {
    const slotHour = parseInt(slot.startTime.split(':')[0]);
    return Math.abs(slotHour - currentHour) <= 1;
  });

  const currentRecommendation = currentOptimal 
    ? `Great time to study! Your performance is typically ${Math.round(currentOptimal.efficiencyScore * 100)}% efficient now.`
    : `Consider studying at ${nextOptimalTime} for optimal performance.`;

  return {
    currentRecommendation,
    nextOptimalTime,
    todaysSlots
  };
}

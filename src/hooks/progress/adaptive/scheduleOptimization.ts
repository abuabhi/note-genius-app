import { EnhancedStudySession } from '../../../hooks/useEnhancedStudySessions';
import { 
  StudySchedule, 
  ScheduleSlot, 
  OptimalTimeSlot, 
  BreakRecommendation,
  StudyPreferences 
} from './types';

export function generateOptimalSchedule(
  userSessions: EnhancedStudySession[],
  preferences: Partial<StudyPreferences> = {}
): StudySchedule {
  const defaultPreferences: StudyPreferences = {
    preferredStudyDuration: 45,
    maxDailyStudyTime: 180, // 3 hours
    preferredDifficulty: 'adaptive',
    breakFrequency: 'moderate',
    studyStyle: 'distributed',
    ...preferences
  };

  const optimalTimes = calculateOptimalTimes(userSessions);
  const weeklyPattern = generateWeeklyPattern(userSessions, defaultPreferences);
  const adaptiveBreaks = generateBreakRecommendations(defaultPreferences);

  return {
    userId: 'current_user',
    weeklyPattern,
    optimizedTimes: optimalTimes,
    adaptiveBreaks,
    preferences: defaultPreferences,
    lastUpdated: new Date().toISOString()
  };
}

function calculateOptimalTimes(sessions: EnhancedStudySession[]): OptimalTimeSlot[] {
  if (sessions.length < 5) {
    // Default optimal times for new users
    return [
      {
        startTime: '09:00',
        endTime: '10:30',
        efficiencyScore: 0.85,
        recommendedSubjects: ['Math', 'Science'],
        cognitiveLoad: 'high'
      },
      {
        startTime: '14:00',
        endTime: '15:30',
        efficiencyScore: 0.75,
        recommendedSubjects: ['Language', 'History'],
        cognitiveLoad: 'medium'
      },
      {
        startTime: '19:00',
        endTime: '20:30',
        efficiencyScore: 0.70,
        recommendedSubjects: ['Review', 'Practice'],
        cognitiveLoad: 'low'
      }
    ];
  }

  // Analyze session performance by hour
  const hourlyPerformance = sessions.reduce((acc, session) => {
    const hour = new Date(session.start_time).getHours();
    const accuracy = session.cards_reviewed && session.cards_reviewed > 0 ? 
      (session.cards_correct || 0) / session.cards_reviewed : 0;
    
    if (!acc[hour]) {
      acc[hour] = { totalAccuracy: 0, sessionCount: 0, subjects: new Set() };
    }
    
    acc[hour].totalAccuracy += accuracy;
    acc[hour].sessionCount += 1;
    // Use flashcard_set_id as subject identifier from study_sessions table
    if (session.flashcard_set_id) acc[hour].subjects.add(`Set ${session.flashcard_set_id}`);
    
    return acc;
  }, {} as Record<number, { totalAccuracy: number; sessionCount: number; subjects: Set<string> }>);

  // Convert to optimal time slots
  return Object.entries(hourlyPerformance)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgAccuracy: data.totalAccuracy / data.sessionCount,
      subjects: Array.from(data.subjects),
      sessionCount: data.sessionCount
    }))
    .filter(item => item.sessionCount >= 2) // Need at least 2 sessions for reliability
    .sort((a, b) => b.avgAccuracy - a.avgAccuracy)
    .slice(0, 3) // Top 3 optimal times
    .map(item => ({
      startTime: `${item.hour.toString().padStart(2, '0')}:00`,
      endTime: `${(item.hour + 1).toString().padStart(2, '0')}:30`,
      efficiencyScore: Math.min(0.95, item.avgAccuracy * 1.2),
      recommendedSubjects: item.subjects,
      cognitiveLoad: getCognitiveLoad(item.hour)
    }));
}

function generateWeeklyPattern(
  sessions: EnhancedStudySession[], 
  preferences: StudyPreferences
): ScheduleSlot[] {
  const pattern: ScheduleSlot[] = [];
  
  // Analyze existing patterns by day of week
  const dayPatterns = sessions.reduce((acc, session) => {
    const dayOfWeek = new Date(session.start_time).getDay();
    const hour = new Date(session.start_time).getHours();
    
    if (!acc[dayOfWeek]) acc[dayOfWeek] = [];
    acc[dayOfWeek].push(hour);
    
    return acc;
  }, {} as Record<number, number[]>);

  // Generate slots for each day
  for (let day = 0; day < 7; day++) {
    const dayHours = dayPatterns[day] || [];
    
    if (dayHours.length > 0) {
      // Use existing patterns
      const avgHour = Math.round(dayHours.reduce((sum, h) => sum + h, 0) / dayHours.length);
      pattern.push(createScheduleSlot(day, avgHour, preferences));
    } else {
      // Create default slots for days without data
      const defaultHour = getDefaultStudyHour(day);
      pattern.push(createScheduleSlot(day, defaultHour, preferences));
    }
  }

  return pattern;
}

function createScheduleSlot(
  dayOfWeek: number, 
  hour: number, 
  preferences: StudyPreferences
): ScheduleSlot {
  const duration = preferences.preferredStudyDuration;
  const endHour = hour + Math.ceil(duration / 60);
  
  return {
    dayOfWeek,
    startTime: `${hour.toString().padStart(2, '0')}:00`,
    endTime: `${endHour.toString().padStart(2, '0')}:00`,
    intensity: getIntensityForTime(hour),
    isFlexible: true
  };
}

function generateBreakRecommendations(preferences: StudyPreferences): BreakRecommendation[] {
  const { preferredStudyDuration, breakFrequency } = preferences;
  
  const recommendations: BreakRecommendation[] = [];
  
  switch (breakFrequency) {
    case 'frequent':
      recommendations.push(
        { afterMinutes: 25, durationMinutes: 5, breakType: 'short', suggestedActivity: 'Deep breathing or stretching' },
        { afterMinutes: 50, durationMinutes: 15, breakType: 'medium', suggestedActivity: 'Walk or light snack' }
      );
      break;
    case 'moderate':
      recommendations.push(
        { afterMinutes: 45, durationMinutes: 10, breakType: 'medium', suggestedActivity: 'Physical movement or hydration' },
        { afterMinutes: 90, durationMinutes: 20, breakType: 'long', suggestedActivity: 'Meal or relaxation' }
      );
      break;
    case 'minimal':
      recommendations.push(
        { afterMinutes: 60, durationMinutes: 10, breakType: 'medium', suggestedActivity: 'Quick refresh break' }
      );
      break;
  }
  
  return recommendations;
}

function getCognitiveLoad(hour: number): 'low' | 'medium' | 'high' {
  if (hour >= 9 && hour <= 11) return 'high'; // Peak morning hours
  if (hour >= 14 && hour <= 16) return 'medium'; // Afternoon
  return 'low'; // Early morning, evening, night
}

function getDefaultStudyHour(dayOfWeek: number): number {
  // Weekend vs weekday defaults
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 10; // 10 AM on weekends
  }
  return 19; // 7 PM on weekdays
}

function getIntensityForTime(hour: number): 'light' | 'moderate' | 'intensive' {
  if (hour >= 9 && hour <= 11) return 'intensive';
  if (hour >= 14 && hour <= 17) return 'moderate';
  return 'light';
}

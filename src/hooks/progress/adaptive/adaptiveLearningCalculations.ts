import { StudySession } from '../../../hooks/useStudySessions';
import { FlashcardProgress } from '../advanced/types';
import { 
  LearningPath, 
  AdaptiveStep, 
  StepPerformance,
  AdaptiveAdjustment,
  BehavioralPattern 
} from './types';

export function generateAdaptiveLearningPath(
  userSessions: StudySession[],
  gradeProgression: FlashcardProgress[],
  subject: string
): LearningPath {
  const subjectSessions = userSessions.filter(s => 
    s.flashcard_set_id && subject // Filter by flashcard_set_id from study_sessions table
  );
  
  const subjectProgress = gradeProgression.filter(p => 
    p.flashcard?.flashcard_set_cards?.[0]?.flashcard_sets?.subject?.toLowerCase() === subject.toLowerCase()
  );

  // Analyze current performance to determine difficulty level
  const avgMastery = subjectProgress.length > 0 
    ? subjectProgress.reduce((sum, p) => sum + (p.mastery_level || 0), 0) / subjectProgress.length
    : 0;

  const difficulty = avgMastery < 30 ? 'beginner' : 
                    avgMastery < 70 ? 'intermediate' : 'advanced';

  // Generate adaptive steps based on current performance
  const adaptiveSteps = generateAdaptiveSteps(difficulty, subjectProgress, subjectSessions);

  return {
    id: `path_${subject}_${Date.now()}`,
    userId: 'current_user',
    subject,
    currentStep: 0,
    totalSteps: adaptiveSteps.length,
    estimatedCompletionDays: Math.ceil(adaptiveSteps.length / 2), // 2 steps per day average
    adaptiveSteps,
    difficulty,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function generateAdaptiveSteps(
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  progress: FlashcardProgress[],
  sessions: StudySession[]
): AdaptiveStep[] {
  const steps: AdaptiveStep[] = [];
  let stepNumber = 1;

  // Foundation phase
  if (difficulty === 'beginner') {
    steps.push(createStep(stepNumber++, 'Foundation Review', 'Review basic concepts', 'flashcards', 15));
    steps.push(createStep(stepNumber++, 'Core Practice', 'Practice fundamental skills', 'practice', 20));
  }

  // Building phase
  steps.push(createStep(stepNumber++, 'Concept Reinforcement', 'Strengthen understanding', 'flashcards', 25));
  steps.push(createStep(stepNumber++, 'Application Quiz', 'Test practical application', 'quiz', 30));

  // Mastery phase
  if (difficulty === 'advanced') {
    steps.push(createStep(stepNumber++, 'Advanced Concepts', 'Explore complex topics', 'flashcards', 35));
    steps.push(createStep(stepNumber++, 'Synthesis Challenge', 'Combine multiple concepts', 'practice', 40));
  }

  // Review and consolidation
  steps.push(createStep(stepNumber++, 'Comprehensive Review', 'Review all learned material', 'review', 20));
  steps.push(createStep(stepNumber++, 'Final Assessment', 'Demonstrate mastery', 'quiz', 30));

  return steps;
}

function createStep(
  stepNumber: number,
  title: string,
  description: string,
  resourceType: 'flashcards' | 'quiz' | 'review' | 'practice',
  estimatedTimeMinutes: number
): AdaptiveStep {
  return {
    stepNumber,
    title,
    description,
    resourceType,
    estimatedTimeMinutes,
    prerequisites: stepNumber > 1 ? [stepNumber - 1] : [],
    completed: false,
    adaptiveAdjustments: []
  };
}

export function analyzeStudyPatterns(sessions: StudySession[]): BehavioralPattern[] {
  const patterns: BehavioralPattern[] = [];

  // Analyze study timing patterns
  const timingPattern = analyzeTimingPattern(sessions);
  if (timingPattern) patterns.push(timingPattern);

  // Analyze session length patterns
  const lengthPattern = analyzeSessionLengthPattern(sessions);
  if (lengthPattern) patterns.push(lengthPattern);

  // Analyze break frequency patterns
  const breakPattern = analyzeBreakPattern(sessions);
  if (breakPattern) patterns.push(breakPattern);

  return patterns;
}

function analyzeTimingPattern(sessions: StudySession[]): BehavioralPattern | null {
  if (sessions.length < 5) return null;

  const hourCounts = sessions.reduce((acc, session) => {
    const hour = new Date(session.start_time).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const peakHour = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0];

  if (!peakHour) return null;

  const [hour, frequency] = peakHour;
  const timeRange = getTimeRange(parseInt(hour));
  
  return {
    patternType: 'study_timing',
    pattern: `Most active during ${timeRange}`,
    frequency: frequency / sessions.length,
    effectiveness: calculateTimingEffectiveness(sessions, parseInt(hour)),
    recommendation: generateTimingRecommendation(parseInt(hour)),
    impact: 'positive'
  };
}

function analyzeSessionLengthPattern(sessions: StudySession[]): BehavioralPattern | null {
  if (sessions.length < 3) return null;

  const avgDuration = sessions
    .filter(s => s.duration && s.duration > 0)
    .reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;

  const lengthCategory = avgDuration < 1800 ? 'short' : 
                        avgDuration < 3600 ? 'medium' : 'long';

  return {
    patternType: 'session_length',
    pattern: `Prefers ${lengthCategory} study sessions (${Math.round(avgDuration / 60)} min avg)`,
    frequency: 1.0,
    effectiveness: calculateLengthEffectiveness(avgDuration),
    recommendation: generateLengthRecommendation(lengthCategory),
    impact: avgDuration > 1200 && avgDuration < 3600 ? 'positive' : 'neutral'
  };
}

function analyzeBreakPattern(sessions: StudySession[]): BehavioralPattern | null {
  // This would analyze break_time data if available
  // For now, return a default pattern
  return {
    patternType: 'break_frequency',
    pattern: 'Moderate break frequency',
    frequency: 0.5,
    effectiveness: 0.7,
    recommendation: 'Consider implementing Pomodoro technique',
    impact: 'neutral'
  };
}

function getTimeRange(hour: number): string {
  if (hour >= 6 && hour < 12) return 'morning (6AM-12PM)';
  if (hour >= 12 && hour < 18) return 'afternoon (12PM-6PM)';
  if (hour >= 18 && hour < 22) return 'evening (6PM-10PM)';
  return 'late night/early morning';
}

function calculateTimingEffectiveness(sessions: StudySession[], peakHour: number): number {
  const peakSessions = sessions.filter(s => 
    new Date(s.start_time).getHours() === peakHour
  );
  
  if (peakSessions.length === 0) return 0.5;

  const avgAccuracy = peakSessions
    .filter(s => s.cards_reviewed && s.cards_reviewed > 0)
    .reduce((sum, s) => sum + ((s.cards_correct || 0) / (s.cards_reviewed || 1)), 0) / peakSessions.length;

  return Math.min(1, avgAccuracy || 0.5);
}

function calculateLengthEffectiveness(avgDuration: number): number {
  // Optimal session length is typically 25-50 minutes
  const optimalMin = 25 * 60; // 25 minutes
  const optimalMax = 50 * 60; // 50 minutes
  
  if (avgDuration >= optimalMin && avgDuration <= optimalMax) {
    return 0.9;
  } else if (avgDuration < optimalMin) {
    return Math.max(0.3, avgDuration / optimalMin * 0.7);
  } else {
    return Math.max(0.4, optimalMax / avgDuration * 0.8);
  }
}

function generateTimingRecommendation(hour: number): string {
  if (hour >= 6 && hour < 12) return 'Morning sessions are great for focus - consider complex topics';
  if (hour >= 12 && hour < 18) return 'Afternoon energy is good for active learning';
  if (hour >= 18 && hour < 22) return 'Evening sessions work well for review and practice';
  return 'Consider shifting to earlier hours for better cognitive performance';
}

function generateLengthRecommendation(category: string): string {
  switch (category) {
    case 'short': return 'Try extending sessions to 25-45 minutes for better retention';
    case 'medium': return 'Your session length is optimal - maintain this pattern';
    case 'long': return 'Consider breaking into shorter sessions with breaks';
    default: return 'Aim for 25-45 minute focused sessions';
  }
}

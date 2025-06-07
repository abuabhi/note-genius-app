
import { EnhancedStudySession } from '../../useEnhancedStudySessions';
import { LearningPath, AdaptiveStep, BehavioralPattern } from './types';

export function generateRealAdaptiveLearningPath(
  userSessions: EnhancedStudySession[],
  flashcardSets: any[],
  userProgress: any[]
): LearningPath[] {
  if (!flashcardSets.length) return [];

  return flashcardSets.map(set => {
    const setSessions = userSessions.filter(s => s.flashcard_set_id === set.id);
    const setProgress = userProgress.filter(p => 
      p.flashcard?.flashcard_set_cards?.[0]?.set_id === set.id
    );

    // Calculate current mastery level for this set
    const avgMastery = setProgress.length > 0 
      ? setProgress.reduce((sum, p) => sum + (p.mastery_level || 0), 0) / setProgress.length
      : 0;

    // Determine difficulty based on performance
    const difficulty = avgMastery < 30 ? 'beginner' : 
                      avgMastery < 70 ? 'intermediate' : 'advanced';

    // Generate adaptive steps based on current state
    const adaptiveSteps = generateRealAdaptiveSteps(setSessions, setProgress, difficulty);
    
    // Calculate estimated completion days based on current pace
    const avgSessionsPerWeek = setSessions.length > 0 ? 
      Math.max(1, Math.round(setSessions.length / 4)) : 2; // Default 2 sessions per week
    const estimatedDays = Math.ceil(adaptiveSteps.length / (avgSessionsPerWeek / 7));

    return {
      id: `path_${set.id}_${Date.now()}`,
      userId: 'current_user',
      subject: set.subject || set.name,
      currentStep: calculateCurrentStep(adaptiveSteps, setProgress),
      totalSteps: adaptiveSteps.length,
      estimatedCompletionDays: estimatedDays,
      adaptiveSteps,
      difficulty,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}

function generateRealAdaptiveSteps(
  sessions: EnhancedStudySession[],
  progress: any[],
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): AdaptiveStep[] {
  const steps: AdaptiveStep[] = [];
  let stepNumber = 1;

  // Phase 1: Foundation (always needed)
  steps.push({
    stepNumber: stepNumber++,
    title: 'Initial Review',
    description: 'Review all cards to establish baseline',
    resourceType: 'flashcards',
    estimatedTimeMinutes: 20,
    prerequisites: [],
    completed: sessions.length > 0,
    adaptiveAdjustments: []
  });

  // Phase 2: Building understanding
  if (difficulty === 'beginner') {
    steps.push({
      stepNumber: stepNumber++,
      title: 'Foundation Practice',
      description: 'Focus on basic concepts and definitions',
      resourceType: 'practice',
      estimatedTimeMinutes: 25,
      prerequisites: [1],
      completed: sessions.length > 2,
      adaptiveAdjustments: []
    });
  }

  // Phase 3: Reinforcement
  steps.push({
    stepNumber: stepNumber++,
    title: 'Active Recall Practice',
    description: 'Test your knowledge with spaced repetition',
    resourceType: 'flashcards',
    estimatedTimeMinutes: 30,
    prerequisites: [stepNumber - 2],
    completed: sessions.length > 3,
    adaptiveAdjustments: []
  });

  // Phase 4: Assessment
  steps.push({
    stepNumber: stepNumber++,
    title: 'Knowledge Check',
    description: 'Quiz yourself to identify weak areas',
    resourceType: 'quiz',
    estimatedTimeMinutes: 15,
    prerequisites: [stepNumber - 2],
    completed: false,
    adaptiveAdjustments: []
  });

  // Phase 5: Mastery (for intermediate/advanced)
  if (difficulty !== 'beginner') {
    steps.push({
      stepNumber: stepNumber++,
      title: 'Advanced Application',
      description: 'Apply knowledge in complex scenarios',
      resourceType: 'practice',
      estimatedTimeMinutes: 35,
      prerequisites: [stepNumber - 2],
      completed: false,
      adaptiveAdjustments: []
    });
  }

  // Phase 6: Final mastery
  steps.push({
    stepNumber: stepNumber++,
    title: 'Mastery Assessment',
    description: 'Final comprehensive review',
    resourceType: 'review',
    estimatedTimeMinutes: 25,
    prerequisites: [stepNumber - 2],
    completed: false,
    adaptiveAdjustments: []
  });

  return steps;
}

function calculateCurrentStep(steps: AdaptiveStep[], progress: any[]): number {
  // Find the first incomplete step
  const incompleteStep = steps.find(step => !step.completed);
  return incompleteStep ? incompleteStep.stepNumber - 1 : steps.length;
}

export function analyzeRealStudyPatterns(sessions: EnhancedStudySession[]): BehavioralPattern[] {
  const patterns: BehavioralPattern[] = [];

  if (sessions.length < 3) {
    return [{
      patternType: 'study_timing',
      pattern: 'Insufficient data - start studying to see patterns',
      frequency: 0,
      effectiveness: 0.5,
      recommendation: 'Complete at least 3 study sessions to analyze patterns',
      impact: 'neutral'
    }];
  }

  // Analyze timing patterns
  const hourFrequency = sessions.reduce((acc, session) => {
    const hour = new Date(session.start_time).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const peakHour = Object.entries(hourFrequency)
    .sort(([,a], [,b]) => b - a)[0];

  if (peakHour) {
    const [hour, frequency] = peakHour;
    const timeRange = getTimeRangeDescription(parseInt(hour));
    patterns.push({
      patternType: 'study_timing',
      pattern: `Most productive during ${timeRange}`,
      frequency: frequency / sessions.length,
      effectiveness: calculateTimingEffectiveness(sessions, parseInt(hour)),
      recommendation: `Continue studying during ${timeRange} for optimal results`,
      impact: 'positive'
    });
  }

  // Analyze session length patterns
  const avgDuration = sessions
    .filter(s => s.duration && s.duration > 0)
    .reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;

  patterns.push({
    patternType: 'session_length',
    pattern: `Average session length: ${Math.round(avgDuration / 60)} minutes`,
    frequency: 1.0,
    effectiveness: calculateSessionLengthEffectiveness(avgDuration),
    recommendation: getSessionLengthRecommendation(avgDuration),
    impact: avgDuration > 1200 && avgDuration < 3600 ? 'positive' : 'neutral'
  });

  return patterns;
}

function getTimeRangeDescription(hour: number): string {
  if (hour >= 6 && hour < 12) return 'morning hours (6AM-12PM)';
  if (hour >= 12 && hour < 18) return 'afternoon (12PM-6PM)';
  if (hour >= 18 && hour < 22) return 'evening (6PM-10PM)';
  return 'late hours (10PM-6AM)';
}

function calculateTimingEffectiveness(sessions: EnhancedStudySession[], peakHour: number): number {
  const peakSessions = sessions.filter(s => 
    new Date(s.start_time).getHours() === peakHour
  );
  
  if (peakSessions.length === 0) return 0.5;

  const avgAccuracy = peakSessions
    .filter(s => s.cards_reviewed && s.cards_reviewed > 0)
    .reduce((sum, s) => sum + ((s.cards_correct || 0) / (s.cards_reviewed || 1)), 0) / peakSessions.length;

  return Math.min(1, avgAccuracy || 0.5);
}

function calculateSessionLengthEffectiveness(avgDuration: number): number {
  const optimalMin = 20 * 60; // 20 minutes
  const optimalMax = 60 * 60; // 60 minutes
  
  if (avgDuration >= optimalMin && avgDuration <= optimalMax) {
    return 0.9;
  } else if (avgDuration < optimalMin) {
    return Math.max(0.3, avgDuration / optimalMin * 0.7);
  } else {
    return Math.max(0.4, optimalMax / avgDuration * 0.8);
  }
}

function getSessionLengthRecommendation(avgDuration: number): string {
  const minutes = Math.round(avgDuration / 60);
  
  if (minutes < 20) {
    return 'Try extending sessions to 20-45 minutes for better retention';
  } else if (minutes > 60) {
    return 'Consider shorter sessions (20-45 minutes) with breaks';
  } else {
    return 'Your session length is optimal - maintain this pattern';
  }
}

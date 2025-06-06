
export interface LearningPath {
  id: string;
  userId: string;
  subject: string;
  currentStep: number;
  totalSteps: number;
  estimatedCompletionDays: number;
  adaptiveSteps: AdaptiveStep[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt: string;
}

export interface AdaptiveStep {
  stepNumber: number;
  title: string;
  description: string;
  resourceType: 'flashcards' | 'quiz' | 'review' | 'practice';
  resourceId?: string;
  estimatedTimeMinutes: number;
  prerequisites: number[];
  completed: boolean;
  completedAt?: string;
  performance?: StepPerformance;
  adaptiveAdjustments: AdaptiveAdjustment[];
}

export interface StepPerformance {
  accuracy: number;
  timeSpent: number;
  attemptsCount: number;
  masteryLevel: number;
  confidenceScore: number;
}

export interface AdaptiveAdjustment {
  adjustmentType: 'difficulty' | 'pace' | 'reinforcement' | 'skip';
  reason: string;
  appliedAt: string;
  effectOnPath: string;
}

export interface StudySchedule {
  userId: string;
  weeklyPattern: ScheduleSlot[];
  optimizedTimes: OptimalTimeSlot[];
  adaptiveBreaks: BreakRecommendation[];
  preferences: StudyPreferences;
  lastUpdated: string;
}

export interface ScheduleSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string;
  subject?: string;
  intensity: 'light' | 'moderate' | 'intensive';
  isFlexible: boolean;
}

export interface OptimalTimeSlot {
  startTime: string;
  endTime: string;
  efficiencyScore: number;
  recommendedSubjects: string[];
  cognitiveLoad: 'low' | 'medium' | 'high';
}

export interface BreakRecommendation {
  afterMinutes: number;
  durationMinutes: number;
  breakType: 'short' | 'medium' | 'long';
  suggestedActivity: string;
}

export interface StudyPreferences {
  preferredStudyDuration: number;
  maxDailyStudyTime: number;
  preferredDifficulty: 'adaptive' | 'challenging' | 'comfortable';
  breakFrequency: 'frequent' | 'moderate' | 'minimal';
  studyStyle: 'intensive' | 'distributed' | 'mixed';
}

export interface PerformanceForecast {
  subjectForecasts: SubjectForecast[];
  overallTrend: 'improving' | 'stable' | 'declining';
  examReadiness: ExamReadiness[];
  riskAreas: RiskArea[];
  recommendedActions: ForecastAction[];
}

export interface SubjectForecast {
  subject: string;
  currentMastery: number;
  projectedMastery: number;
  projectionDate: string;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  factors: string[];
}

export interface ExamReadiness {
  subject: string;
  examDate?: string;
  readinessScore: number;
  recommendedStudyHours: number;
  criticalTopics: string[];
  strengthAreas: string[];
}

export interface RiskArea {
  area: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  mitigation: string[];
}

export interface ForecastAction {
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  expectedImpact: string;
  timeframe: string;
  category: 'study_schedule' | 'content_focus' | 'technique' | 'motivation';
}

export interface BehavioralPattern {
  patternType: 'study_timing' | 'session_length' | 'break_frequency' | 'difficulty_preference' | 'subject_rotation';
  pattern: string;
  frequency: number;
  effectiveness: number;
  recommendation: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export interface AdaptiveLearningInsights {
  learningPaths: LearningPath[];
  studySchedule: StudySchedule;
  performanceForecast: PerformanceForecast;
  behavioralPatterns: BehavioralPattern[];
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface OptimizationSuggestion {
  category: 'schedule' | 'content' | 'technique' | 'environment';
  suggestion: string;
  rationale: string;
  expectedBenefit: string;
  implementationDifficulty: 'easy' | 'moderate' | 'challenging';
  priority: number;
}

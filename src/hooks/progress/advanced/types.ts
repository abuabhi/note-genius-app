
export interface PerformancePrediction {
  weeklyGoalLikelihood: number;
  optimalStudyTimes: string[];
  difficultyProgression: 'too_easy' | 'optimal' | 'too_hard';
  burnoutRisk: 'low' | 'medium' | 'high';
  recommendedBreakFrequency: number; // minutes
}

export interface ComparativeMetrics {
  performancePercentile: number;
  averagePeerStudyTime: number;
  streakComparison: 'below_average' | 'average' | 'above_average';
  subjectRankings: { subject: string; percentile: number }[];
}

export interface StudyRecommendation {
  type: 'focus_subject' | 'increase_difficulty' | 'review_weak_areas' | 'take_break' | 'maintain_pace';
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  message: string;
  estimatedImpact: string;
}

export interface AdvancedAnalytics {
  performancePrediction: PerformancePrediction;
  comparativeMetrics: ComparativeMetrics;
  studyRecommendations: StudyRecommendation[];
  learningVelocityTrend: 'accelerating' | 'stable' | 'declining';
  optimalStudyDuration: number; // minutes
}

export interface StudySession {
  start_time: string;
  duration: number;
  cards_correct?: number;
  cards_reviewed?: number;
}

export interface FlashcardProgress {
  grade: string;
  mastery_level: number;
  flashcard?: {
    flashcard_set_cards?: Array<{
      flashcard_sets?: {
        subject: string;
      };
    }>;
  };
}


export interface StudySession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  cards_reviewed: number;
  cards_correct: number;
  subject?: string;
  session_quality: string;
}

export interface FlashcardProgress {
  id: string;
  subject: string;
  masteryLevel: number;
  totalCards: number;
  masteredCards: number;
  gradeDistribution: Array<{
    grade: string;
    percentage: number;
  }>;
}

export interface PerformancePrediction {
  weeklyGoalLikelihood: number;
  optimalStudyTimes: string[];
  difficultyProgression: 'too_easy' | 'optimal' | 'too_hard';
  burnoutRisk: 'low' | 'medium' | 'high';
  recommendedBreakFrequency: number;
}

export interface ComparativeMetrics {
  performancePercentile: number;
  averagePeerStudyTime: number;
  streakComparison: 'below_average' | 'average' | 'above_average';
  subjectRankings: Array<{
    subject: string;
    rank: number;
    percentile: number;
  }>;
}

export interface StudyRecommendation {
  type: 'focus_subject' | 'take_break' | 'review_weak_areas' | 'maintain_pace' | 'increase_difficulty';
  subject?: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  estimatedImpact: string;
}

export interface AdvancedAnalytics {
  performancePrediction: PerformancePrediction;
  comparativeMetrics: ComparativeMetrics;
  studyRecommendations: StudyRecommendation[];
  learningVelocityTrend: 'improving' | 'stable' | 'declining';
  optimalStudyDuration: number;
}

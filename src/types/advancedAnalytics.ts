
export interface PredictiveLearningData {
  learningVelocity: number;
  difficultyProgression: 'too_fast' | 'optimal' | 'too_slow';
  retentionProbability: number;
  performanceTrend: 'improving' | 'stable' | 'declining';
  studyOutcomePrediction: {
    weeklyGoalLikelihood: number;
    optimalStudyTimes: string[];
    recommendedBreakFrequency: number;
  };
}

export interface AdvancedPerformanceMetrics {
  cognitiveLoadScore: number;
  learningEfficiency: number;
  subjectMastery: Record<string, number>;
  comparativePerformance: {
    percentileRank: number;
    averagePeerPerformance: number;
  };
  learningAcceleration: number;
  sessionQualityScore: number;
}

export interface BehavioralPattern {
  id: string;
  type: 'study_time' | 'break_frequency' | 'learning_style' | 'attention_span';
  pattern: any;
  strength: number;
  detectedAt: string;
  recommendations: string[];
}

export interface LearningInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'warning' | 'achievement';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  expiresAt: string;
}

export interface ComparativeBenchmark {
  metric: string;
  userValue: number;
  benchmarkValue: number;
  percentile: number;
  trend: 'above' | 'at' | 'below';
}

export interface AdvancedAnalyticsData {
  predictiveLearning: PredictiveLearningData;
  performanceMetrics: AdvancedPerformanceMetrics;
  behavioralPatterns: BehavioralPattern[];
  insights: LearningInsight[];
  comparativeBenchmarks: ComparativeBenchmark[];
  lastUpdated: string;
}


import { useSessionAnalytics } from '../../../hooks/useSessionAnalytics';

export const useAdaptiveLearningCalculations = () => {
  const { analytics, sessions } = useSessionAnalytics();

  // Calculate performance trends
  const calculatePerformanceTrend = () => {
    if (!sessions || sessions.length < 2) return 0;

    const recentSessions = sessions.slice(0, 5);
    const accuracyTrend = recentSessions.reduce((acc, session, index) => {
      const accuracy = session.cards_correct && session.cards_reviewed 
        ? (session.cards_correct / session.cards_reviewed) * 100 
        : 0;
      return acc + (accuracy * (index + 1)); // Weight recent sessions more
    }, 0) / (recentSessions.length * (recentSessions.length + 1) / 2);

    return Math.round(accuracyTrend);
  };

  // Calculate difficulty adjustment
  const calculateDifficultyAdjustment = (currentAccuracy: number) => {
    if (currentAccuracy > 90) return 'increase';
    if (currentAccuracy < 60) return 'decrease';
    return 'maintain';
  };

  // Calculate optimal study time
  const calculateOptimalStudyTime = () => {
    const avgSessionTime = analytics.averageSessionTime || 30;
    const recentPerformance = calculatePerformanceTrend();
    
    // Adjust based on performance
    if (recentPerformance > 80) {
      return Math.min(avgSessionTime * 1.2, 60); // Max 60 minutes
    } else if (recentPerformance < 60) {
      return Math.max(avgSessionTime * 0.8, 15); // Min 15 minutes
    }
    
    return avgSessionTime;
  };

  // Calculate spaced repetition intervals
  const calculateSpacedRepetitionInterval = (
    previousInterval: number,
    accuracy: number,
    repetitionCount: number
  ) => {
    const easeFactor = Math.max(1.3, 2.5 + (0.1 * (accuracy / 100 - 0.8) * 5));
    
    if (repetitionCount === 1) return 1;
    if (repetitionCount === 2) return 6;
    
    return Math.round(previousInterval * easeFactor);
  };

  // Calculate learning path progression
  const calculateLearningPathProgression = (subjectStats: any) => {
    const totalCards = subjectStats?.totalCards || 0;
    const masteredCards = subjectStats?.masteredCards || 0;
    const averageAccuracy = subjectStats?.averageAccuracy || 0;
    
    if (totalCards === 0) return 0;
    
    const completionRate = masteredCards / totalCards;
    const accuracyWeight = Math.min(averageAccuracy / 100, 1);
    
    return Math.round((completionRate * 0.7 + accuracyWeight * 0.3) * 100);
  };

  // Calculate cognitive load
  const calculateCognitiveLoad = (sessionDuration: number, accuracy: number) => {
    // Convert minutes to a load factor
    const durationFactor = Math.min(sessionDuration / 60, 1); // Normalize to 1 hour
    const accuracyFactor = 1 - (accuracy / 100); // Lower accuracy = higher load
    
    const cognitiveLoad = (durationFactor * 0.4 + accuracyFactor * 0.6) * 100;
    
    if (cognitiveLoad > 70) return 'high';
    if (cognitiveLoad > 40) return 'medium';
    return 'low';
  };

  // Calculate retention prediction
  const calculateRetentionPrediction = (
    lastReviewDate: Date,
    reviewCount: number,
    accuracy: number
  ) => {
    const daysSinceReview = Math.floor(
      (Date.now() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Forgetting curve calculation
    const retentionBase = Math.pow(accuracy / 100, 0.5);
    const timeDecay = Math.exp(-daysSinceReview / (reviewCount + 1));
    
    return Math.round(retentionBase * timeDecay * 100);
  };

  // Calculate subject mastery level
  const calculateSubjectMasteryLevel = (subjectData: any) => {
    const sessions = subjectData?.sessions || [];
    const totalAccuracy = sessions.reduce((sum: number, session: any) => {
      const accuracy = session.cards_correct && session.cards_reviewed 
        ? (session.cards_correct / session.cards_reviewed) * 100 
        : 0;
      return sum + accuracy;
    }, 0);
    
    const avgAccuracy = sessions.length > 0 ? totalAccuracy / sessions.length : 0;
    const consistencyScore = calculateConsistencyScore(sessions);
    
    const masteryScore = (avgAccuracy * 0.7 + consistencyScore * 0.3);
    
    if (masteryScore >= 85) return 'expert';
    if (masteryScore >= 70) return 'advanced';
    if (masteryScore >= 55) return 'intermediate';
    return 'beginner';
  };

  // Calculate consistency score
  const calculateConsistencyScore = (sessions: any[]) => {
    if (sessions.length < 2) return 0;
    
    const accuracies = sessions.map((session: any) => {
      return session.cards_correct && session.cards_reviewed 
        ? (session.cards_correct / session.cards_reviewed) * 100 
        : 0;
    });
    
    const mean = accuracies.reduce((sum: number, acc: number) => sum + acc, 0) / accuracies.length;
    const variance = accuracies.reduce((sum: number, acc: number) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 100 - standardDeviation);
  };

  return {
    calculatePerformanceTrend,
    calculateDifficultyAdjustment,
    calculateOptimalStudyTime,
    calculateSpacedRepetitionInterval,
    calculateLearningPathProgression,
    calculateCognitiveLoad,
    calculateRetentionPrediction,
    calculateSubjectMasteryLevel,
    calculateConsistencyScore
  };
};

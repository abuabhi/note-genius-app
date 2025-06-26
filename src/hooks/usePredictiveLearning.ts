
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSmartSessionAnalytics } from './useSmartSessionAnalytics';
import { useRealTimeSessionTracker } from './useRealTimeSessionTracker';

interface LearningPrediction {
  topicMasteryETA: Record<string, number>; // topic -> days to mastery
  sessionSuccessProbability: number; // 0-1
  optimalNextTopics: string[];
  knowledgeGaps: string[];
  reviewSchedule: Array<{
    topic: string;
    date: Date;
    priority: 'low' | 'medium' | 'high';
    reason: string;
  }>;
}

interface LearningVelocity {
  current: number; // cards per hour
  trend: 'accelerating' | 'stable' | 'declining';
  projection: number; // predicted cards per hour in 7 days
}

export const usePredictiveLearning = () => {
  const { analytics } = useSmartSessionAnalytics();
  const { metrics, activities } = useRealTimeSessionTracker();
  const [predictions, setPredictions] = useState<LearningPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculate learning velocity from session data
  const learningVelocity = useMemo((): LearningVelocity => {
    const recentActivities = activities.slice(-50);
    const sessionDuration = recentActivities.length > 0 
      ? (recentActivities[recentActivities.length - 1].timestamp - recentActivities[0].timestamp) / (1000 * 60 * 60)
      : 1;
    
    const cardsPerHour = recentActivities.filter(a => 
      a.activityType === 'answer_correct' || a.activityType === 'answer_incorrect'
    ).length / Math.max(sessionDuration, 0.1);

    // Simple trend calculation based on recent performance
    const recentPerformance = activities.slice(-20).filter(a => 
      a.activityType === 'answer_correct'
    ).length / Math.max(activities.slice(-20).length, 1);

    let trend: LearningVelocity['trend'] = 'stable';
    if (recentPerformance > 0.8) trend = 'accelerating';
    else if (recentPerformance < 0.5) trend = 'declining';

    return {
      current: cardsPerHour,
      trend,
      projection: cardsPerHour * (trend === 'accelerating' ? 1.2 : trend === 'declining' ? 0.8 : 1),
    };
  }, [activities]);

  // Generate predictions based on analytics and current performance
  const generatePredictions = useCallback(async () => {
    if (!analytics) return;

    setIsAnalyzing(true);
    
    try {
      // Simulate ML-like analysis with realistic delays
      await new Promise(resolve => setTimeout(resolve, 1000));

      const topicMasteryETA: Record<string, number> = {};
      const knowledgeGaps: string[] = [];
      const optimalNextTopics: string[] = [];

      // Analyze each subject's difficulty and predict mastery time
      Object.entries(analytics.subjectDifficulty).forEach(([subject, difficulty]) => {
        const currentPerformance = analytics.timeSlotPerformance[new Date().getHours()] || 3;
        const averagePerformance = Object.values(analytics.timeSlotPerformance)
          .filter(p => p > 0)
          .reduce((a, b) => a + b, 0) / Math.max(Object.values(analytics.timeSlotPerformance).filter(p => p > 0).length, 1);

        // Predict days to mastery based on difficulty and current performance
        const masteryDays = Math.max(1, Math.round(
          (difficulty * 7) / Math.max(currentPerformance, 1) * (5 / Math.max(averagePerformance, 1))
        ));

        topicMasteryETA[subject] = masteryDays;

        // Identify knowledge gaps (high difficulty, low performance)
        if (difficulty > 3 && currentPerformance < 3) {
          knowledgeGaps.push(subject);
        }

        // Recommend optimal next topics (moderate difficulty, decent performance)
        if (difficulty >= 2 && difficulty <= 3.5 && currentPerformance >= 3) {
          optimalNextTopics.push(subject);
        }
      });

      // Calculate session success probability based on current metrics
      const sessionSuccessProbability = Math.min(1, 
        (metrics.focusLevel / 100) * 0.3 +
        (metrics.engagementLevel / 100) * 0.3 +
        (metrics.accuracyRate / 100) * 0.4
      );

      // Generate review schedule based on spaced repetition and performance
      const reviewSchedule = Object.entries(topicMasteryETA)
        .map(([topic, days]) => {
          const priority = days <= 3 ? 'high' : days <= 7 ? 'medium' : 'low';
          const reviewDate = new Date();
          reviewDate.setDate(reviewDate.getDate() + Math.max(1, Math.floor(days / 3)));

          return {
            topic,
            date: reviewDate,
            priority: priority as 'low' | 'medium' | 'high',
            reason: days <= 3 ? 'Critical review needed' : 
                   days <= 7 ? 'Regular review recommended' : 
                   'Maintenance review',
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      setPredictions({
        topicMasteryETA,
        sessionSuccessProbability,
        optimalNextTopics: optimalNextTopics.slice(0, 3),
        knowledgeGaps: knowledgeGaps.slice(0, 5),
        reviewSchedule: reviewSchedule.slice(0, 10),
      });

      console.log('🔮 [PREDICTIVE LEARNING] Generated predictions:', {
        topics: Object.keys(topicMasteryETA).length,
        successProbability: sessionSuccessProbability,
        gaps: knowledgeGaps.length,
      });

    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [analytics, metrics]);

  // Auto-generate predictions when analytics or metrics change significantly
  useEffect(() => {
    if (analytics && activities.length > 5) {
      generatePredictions();
    }
  }, [analytics, activities.length, generatePredictions]);

  const getPredictedOptimalStudyTime = useCallback(() => {
    if (!predictions) return 45; // default

    const focusBonus = metrics.focusLevel > 80 ? 15 : 0;
    const engagementBonus = metrics.engagementLevel > 70 ? 10 : 0;
    const baseTime = 30 + (predictions.sessionSuccessProbability * 30);

    return Math.round(baseTime + focusBonus + engagementBonus);
  }, [predictions, metrics]);

  const getPredictedBreakNeeds = useCallback(() => {
    if (!learningVelocity) return { frequency: 'normal', duration: 5 };

    if (learningVelocity.trend === 'declining') {
      return { frequency: 'frequent', duration: 10 };
    } else if (learningVelocity.trend === 'accelerating') {
      return { frequency: 'minimal', duration: 3 };
    }

    return { frequency: 'normal', duration: 5 };
  }, [learningVelocity]);

  const getPersonalizedRecommendations = useCallback(() => {
    if (!predictions) return [];

    const recommendations = [];

    // High-priority knowledge gaps
    if (predictions.knowledgeGaps.length > 0) {
      recommendations.push({
        type: 'focus_area',
        message: `Focus on ${predictions.knowledgeGaps[0]} - this is your biggest knowledge gap`,
        priority: 'high',
      });
    }

    // Optimal next topics
    if (predictions.optimalNextTopics.length > 0) {
      recommendations.push({
        type: 'next_topic',
        message: `Ready for ${predictions.optimalNextTopics[0]}? You're showing good progress`,
        priority: 'medium',
      });
    }

    // Session timing
    if (predictions.sessionSuccessProbability < 0.6) {
      recommendations.push({
        type: 'timing',
        message: 'Consider studying during your peak hours for better results',
        priority: 'medium',
      });
    }

    return recommendations;
  }, [predictions]);

  return {
    predictions,
    learningVelocity,
    isAnalyzing,
    generatePredictions,
    getPredictedOptimalStudyTime,
    getPredictedBreakNeeds,
    getPersonalizedRecommendations,
  };
};

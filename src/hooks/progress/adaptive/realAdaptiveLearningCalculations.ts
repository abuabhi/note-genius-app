
import { useMemo } from 'react';
import { useSessionAnalytics } from '../../useSessionAnalytics';

export interface AdaptiveLearningMetrics {
  difficultyAdjustment: 'increase' | 'decrease' | 'maintain';
  optimalSessionLength: number;
  nextReviewDate: Date;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  retentionProbability: number;
  cognitiveLoad: 'low' | 'medium' | 'high';
  personalizedRecommendations: string[];
}

export const useRealAdaptiveLearningCalculations = () => {
  const { analytics, sessions } = useSessionAnalytics();

  const adaptiveLearningMetrics = useMemo((): AdaptiveLearningMetrics => {
    if (!sessions || sessions.length === 0) {
      return {
        difficultyAdjustment: 'maintain',
        optimalSessionLength: 30,
        nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        masteryLevel: 'beginner',
        retentionProbability: 50,
        cognitiveLoad: 'medium',
        personalizedRecommendations: ['Start with basic study sessions']
      };
    }

    // Calculate recent performance
    const recentSessions = sessions.slice(0, 5);
    const totalCards = recentSessions.reduce((sum, session) => sum + (session.cards_reviewed || 0), 0);
    const correctCards = recentSessions.reduce((sum, session) => sum + (session.cards_correct || 0), 0);
    const recentAccuracy = totalCards > 0 ? (correctCards / totalCards) * 100 : 0;

    // Determine difficulty adjustment
    let difficultyAdjustment: 'increase' | 'decrease' | 'maintain' = 'maintain';
    if (recentAccuracy > 85) {
      difficultyAdjustment = 'increase';
    } else if (recentAccuracy < 60) {
      difficultyAdjustment = 'decrease';
    }

    // Calculate optimal session length
    const avgSessionTime = analytics.averageSessionTime || 30;
    let optimalSessionLength = avgSessionTime;
    if (recentAccuracy > 80) {
      optimalSessionLength = Math.min(avgSessionTime * 1.2, 60);
    } else if (recentAccuracy < 60) {
      optimalSessionLength = Math.max(avgSessionTime * 0.8, 15);
    }

    // Calculate mastery level
    let masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';
    if (recentAccuracy >= 85 && analytics.totalSessions >= 20) {
      masteryLevel = 'expert';
    } else if (recentAccuracy >= 75 && analytics.totalSessions >= 10) {
      masteryLevel = 'advanced';
    } else if (recentAccuracy >= 60 && analytics.totalSessions >= 5) {
      masteryLevel = 'intermediate';
    }

    // Calculate retention probability
    const retentionProbability = Math.min(100, Math.max(0, 
      (recentAccuracy * 0.7) + (analytics.totalSessions * 0.5)
    ));

    // Calculate cognitive load
    let cognitiveLoad: 'low' | 'medium' | 'high' = 'medium';
    const avgDuration = analytics.averageSessionTime || 30;
    if (avgDuration > 45 && recentAccuracy < 70) {
      cognitiveLoad = 'high';
    } else if (avgDuration < 30 && recentAccuracy > 80) {
      cognitiveLoad = 'low';
    }

    // Generate personalized recommendations
    const personalizedRecommendations: string[] = [];
    if (difficultyAdjustment === 'increase') {
      personalizedRecommendations.push('Ready for more challenging material');
    }
    if (difficultyAdjustment === 'decrease') {
      personalizedRecommendations.push('Focus on reviewing basic concepts');
    }
    if (cognitiveLoad === 'high') {
      personalizedRecommendations.push('Consider shorter study sessions');
    }
    if (analytics.totalSessions < 5) {
      personalizedRecommendations.push('Build a consistent study routine');
    }

    return {
      difficultyAdjustment,
      optimalSessionLength: Math.round(optimalSessionLength),
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      masteryLevel,
      retentionProbability: Math.round(retentionProbability),
      cognitiveLoad,
      personalizedRecommendations
    };
  }, [analytics, sessions]);

  return {
    adaptiveLearningMetrics
  };
};

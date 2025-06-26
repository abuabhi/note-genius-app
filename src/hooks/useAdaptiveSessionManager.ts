
import { useState, useEffect, useCallback } from 'react';
import { useRealTimeSessionTracker } from './useRealTimeSessionTracker';

interface AdaptiveRecommendation {
  type: 'difficulty_adjust' | 'break_insert' | 'topic_switch' | 'duration_adjust' | 'encouragement';
  urgency: 'low' | 'medium' | 'high';
  message: string;
  action: () => void;
  autoApply: boolean;
}

interface SessionAdaptations {
  difficultyLevel: number; // 1-5
  suggestedBreakIn: number; // minutes
  topicSwitchRecommended: boolean;
  sessionExtension: number; // minutes
  encouragementNeeded: boolean;
}

export const useAdaptiveSessionManager = () => {
  const { metrics, recordSessionActivity, getRecentPerformanceTrend } = useRealTimeSessionTracker();
  const [adaptations, setAdaptations] = useState<SessionAdaptations>({
    difficultyLevel: 3,
    suggestedBreakIn: 0,
    topicSwitchRecommended: false,
    sessionExtension: 0,
    encouragementNeeded: false,
  });
  
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [autoAdaptationsEnabled, setAutoAdaptationsEnabled] = useState(true);

  // Generate recommendations based on real-time metrics
  useEffect(() => {
    const newRecommendations: AdaptiveRecommendation[] = [];

    // Check if user is struggling
    if (metrics.strugglingIndicator && metrics.accuracyRate < 50) {
      newRecommendations.push({
        type: 'difficulty_adjust',
        urgency: 'high',
        message: 'Consider reducing difficulty to build confidence',
        action: () => adjustDifficulty(-1),
        autoApply: autoAdaptationsEnabled,
      });
    }

    // Check if user is excelling
    if (metrics.excellingIndicator && metrics.accuracyRate > 90) {
      newRecommendations.push({
        type: 'difficulty_adjust',
        urgency: 'medium',
        message: 'You\'re doing great! Ready for a challenge?',
        action: () => adjustDifficulty(1),
        autoApply: autoAdaptationsEnabled,
      });
    }

    // Check focus levels for break suggestions
    if (metrics.focusLevel < 40) {
      newRecommendations.push({
        type: 'break_insert',
        urgency: 'high',
        message: 'Time for a 5-minute break to refresh your focus',
        action: () => suggestBreak(5),
        autoApply: autoAdaptationsEnabled,
      });
    }

    // Check engagement for topic switching
    if (metrics.engagementLevel < 30 && getRecentPerformanceTrend() === 'declining') {
      newRecommendations.push({
        type: 'topic_switch',
        urgency: 'medium',
        message: 'Consider switching to a different topic',
        action: () => recommendTopicSwitch(),
        autoApply: false, // Never auto-apply topic switches
      });
    }

    // Provide encouragement when needed
    if (metrics.sessionQuality === 'poor' && !metrics.strugglingIndicator) {
      newRecommendations.push({
        type: 'encouragement',
        urgency: 'low',
        message: 'You\'re building knowledge! Every mistake is progress.',
        action: () => setAdaptations(prev => ({ ...prev, encouragementNeeded: true })),
        autoApply: true,
      });
    }

    setRecommendations(newRecommendations);

    // Auto-apply high urgency recommendations if enabled
    if (autoAdaptationsEnabled) {
      newRecommendations
        .filter(rec => rec.urgency === 'high' && rec.autoApply)
        .forEach(rec => {
          rec.action();
          console.log('🤖 [ADAPTIVE MANAGER] Auto-applied:', rec.message);
        });
    }
  }, [metrics, autoAdaptationsEnabled, getRecentPerformanceTrend]);

  const adjustDifficulty = useCallback((change: number) => {
    setAdaptations(prev => {
      const newLevel = Math.max(1, Math.min(5, prev.difficultyLevel + change));
      recordSessionActivity('navigation', undefined, { 
        difficultyAdjustment: change,
        newLevel 
      });
      
      return {
        ...prev,
        difficultyLevel: newLevel,
      };
    });
  }, [recordSessionActivity]);

  const suggestBreak = useCallback((minutes: number) => {
    setAdaptations(prev => ({
      ...prev,
      suggestedBreakIn: minutes,
    }));
    
    recordSessionActivity('navigation', undefined, { 
      breakSuggested: true,
      duration: minutes 
    });
  }, [recordSessionActivity]);

  const recommendTopicSwitch = useCallback(() => {
    setAdaptations(prev => ({
      ...prev,
      topicSwitchRecommended: true,
    }));
    
    recordSessionActivity('navigation', undefined, { 
      topicSwitchRecommended: true 
    });
  }, [recordSessionActivity]);

  const extendSession = useCallback((minutes: number) => {
    setAdaptations(prev => ({
      ...prev,
      sessionExtension: prev.sessionExtension + minutes,
    }));
  }, []);

  const applyRecommendation = useCallback((recommendation: AdaptiveRecommendation) => {
    recommendation.action();
    setRecommendations(prev => prev.filter(r => r !== recommendation));
  }, []);

  const dismissRecommendation = useCallback((recommendation: AdaptiveRecommendation) => {
    setRecommendations(prev => prev.filter(r => r !== recommendation));
  }, []);

  const getAdaptiveInsights = useCallback(() => {
    return {
      performanceTrend: getRecentPerformanceTrend(),
      optimalDifficulty: adaptations.difficultyLevel,
      recommendedStudyTime: Math.max(15, 45 - (100 - metrics.focusLevel) / 4),
      learningEfficiency: (metrics.accuracyRate * metrics.focusLevel * metrics.engagementLevel) / 10000,
      nextOptimalSession: Date.now() + (adaptations.suggestedBreakIn * 60 * 1000),
    };
  }, [adaptations, metrics, getRecentPerformanceTrend]);

  return {
    adaptations,
    recommendations,
    autoAdaptationsEnabled,
    setAutoAdaptationsEnabled,
    adjustDifficulty,
    suggestBreak,
    recommendTopicSwitch,
    extendSession,
    applyRecommendation,
    dismissRecommendation,
    getAdaptiveInsights,
  };
};

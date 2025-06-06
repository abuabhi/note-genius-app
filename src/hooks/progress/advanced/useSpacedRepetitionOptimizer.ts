
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface SpacedRepetitionMetrics {
  flashcardId: string;
  easeFactor: number;
  interval: number;
  repetition: number;
  lastScore: number;
  optimalInterval: number;
  retentionProbability: number;
  difficultyAdjustment: number;
}

interface OptimizationResult {
  recommendedInterval: number;
  confidenceLevel: number;
  adjustmentReason: string;
  nextReviewDate: Date;
}

export const useSpacedRepetitionOptimizer = () => {
  const { user } = useAuth();
  const [optimizedMetrics, setOptimizedMetrics] = useState<Map<string, SpacedRepetitionMetrics>>(new Map());
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Advanced SM-2 algorithm with machine learning adjustments
  const calculateOptimizedInterval = useCallback((
    currentEaseFactor: number,
    currentInterval: number,
    currentRepetition: number,
    lastScore: number,
    historicalPerformance: number[],
    timeOfDay: number,
    sessionQuality: number
  ): OptimizationResult => {
    let newEaseFactor = currentEaseFactor;
    let newInterval = currentInterval;
    
    // Base SM-2 calculation with enhancements
    if (lastScore >= 3) {
      if (currentRepetition === 0) {
        newInterval = 1;
      } else if (currentRepetition === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(currentInterval * newEaseFactor);
      }
      
      // Adjust ease factor based on score
      newEaseFactor = newEaseFactor + (0.1 - (5 - lastScore) * (0.08 + (5 - lastScore) * 0.02));
    } else {
      newInterval = 1;
      newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
    }

    // Machine learning adjustments based on historical performance
    const avgPerformance = historicalPerformance.length > 0 
      ? historicalPerformance.reduce((sum, score) => sum + score, 0) / historicalPerformance.length
      : lastScore;

    // Time-of-day optimization
    const timeMultiplier = timeOfDay >= 9 && timeOfDay <= 11 ? 1.1 : 
                          timeOfDay >= 14 && timeOfDay <= 16 ? 1.05 : 
                          timeOfDay >= 19 && timeOfDay <= 21 ? 0.95 : 1.0;

    // Session quality adjustment
    const qualityMultiplier = sessionQuality > 0.8 ? 1.1 : sessionQuality < 0.6 ? 0.9 : 1.0;

    // Performance trend adjustment
    const performanceMultiplier = avgPerformance > 4 ? 1.15 : avgPerformance < 3 ? 0.85 : 1.0;

    // Apply all optimizations
    const optimizedInterval = Math.round(newInterval * timeMultiplier * qualityMultiplier * performanceMultiplier);
    
    // Calculate retention probability using forgetting curve
    const retentionProbability = Math.exp(-optimizedInterval / (newEaseFactor * 10));
    
    // Confidence level based on data quality
    const confidenceLevel = Math.min(0.95, 0.5 + (historicalPerformance.length * 0.05));

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + optimizedInterval);

    let adjustmentReason = 'Standard spaced repetition';
    if (timeMultiplier !== 1.0) adjustmentReason += ', time-of-day optimized';
    if (qualityMultiplier !== 1.0) adjustmentReason += ', session quality adjusted';
    if (performanceMultiplier !== 1.0) adjustmentReason += ', performance trend considered';

    return {
      recommendedInterval: optimizedInterval,
      confidenceLevel,
      adjustmentReason,
      nextReviewDate
    };
  }, []);

  // Analyze user's learning patterns for optimization
  const analyzeUserPatterns = useCallback(async (flashcardId: string) => {
    if (!user) return null;

    try {
      // Get historical performance data
      const { data: progressData } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId);

      const { data: sessionData } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(10);

      if (!progressData?.[0]) return null;

      const progress = progressData[0];
      const recentSessions = sessionData || [];

      // Calculate historical performance scores
      const historicalScores = recentSessions
        .filter(session => session.cards_reviewed > 0)
        .map(session => (session.cards_correct || 0) / (session.cards_reviewed || 1) * 5);

      // Determine current time of day
      const currentHour = new Date().getHours();

      // Calculate session quality from recent sessions
      const avgSessionQuality = recentSessions.length > 0
        ? recentSessions.reduce((sum, session) => {
            const quality = session.session_quality === 'excellent' ? 1.0 :
                           session.session_quality === 'good' ? 0.8 :
                           session.session_quality === 'needs_improvement' ? 0.6 : 0.4;
            return sum + quality;
          }, 0) / recentSessions.length
        : 0.7;

      return calculateOptimizedInterval(
        progress.ease_factor || 2.5,
        progress.interval || 0,
        progress.repetition || 0,
        progress.last_score || 3,
        historicalScores,
        currentHour,
        avgSessionQuality
      );
    } catch (error) {
      console.error('Error analyzing user patterns:', error);
      return null;
    }
  }, [user, calculateOptimizedInterval]);

  // Optimize multiple flashcards at once
  const optimizeFlashcardSet = useCallback(async (flashcardIds: string[]) => {
    if (!user) return;

    setIsOptimizing(true);
    try {
      const optimizations = new Map<string, OptimizationResult>();

      for (const flashcardId of flashcardIds) {
        const optimization = await analyzeUserPatterns(flashcardId);
        if (optimization) {
          optimizations.set(flashcardId, optimization);
        }
      }

      // Apply optimizations to database
      for (const [flashcardId, optimization] of optimizations.entries()) {
        await supabase
          .from('user_flashcard_progress')
          .upsert({
            user_id: user.id,
            flashcard_id: flashcardId,
            next_review_at: optimization.nextReviewDate.toISOString(),
            interval: optimization.recommendedInterval,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,flashcard_id' });
      }

      console.log('Optimized spaced repetition for', optimizations.size, 'flashcards');
    } catch (error) {
      console.error('Error optimizing flashcard set:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [user, analyzeUserPatterns]);

  // Get optimization recommendations for a specific flashcard
  const getOptimizationRecommendation = useCallback(async (flashcardId: string) => {
    const optimization = await analyzeUserPatterns(flashcardId);
    return optimization;
  }, [analyzeUserPatterns]);

  return {
    optimizedMetrics,
    isOptimizing,
    optimizeFlashcardSet,
    getOptimizationRecommendation,
    analyzeUserPatterns
  };
};

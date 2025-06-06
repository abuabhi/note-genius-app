
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface DifficultyMetrics {
  flashcardId: string;
  currentDifficulty: number;
  recommendedDifficulty: number;
  adjustmentReason: string;
  confidenceLevel: number;
  learningVelocity: number;
}

interface DifficultyAdjustmentConfig {
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  adaptationSpeed: number;
  minimumDataPoints: number;
}

export const useDifficultyAdjustment = () => {
  const { user } = useAuth();
  const [difficultyMetrics, setDifficultyMetrics] = useState<Map<string, DifficultyMetrics>>(new Map());
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Advanced difficulty calculation algorithm
  const calculateOptimalDifficulty = useCallback((
    recentScores: number[],
    responseTimeData: number[],
    retentionRates: number[],
    currentDifficulty: number,
    config: DifficultyAdjustmentConfig
  ): DifficultyMetrics => {
    if (recentScores.length < config.minimumDataPoints) {
      return {
        flashcardId: '',
        currentDifficulty,
        recommendedDifficulty: currentDifficulty,
        adjustmentReason: 'Insufficient data for adjustment',
        confidenceLevel: 0.1,
        learningVelocity: 0
      };
    }

    // Calculate performance metrics
    const avgScore = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const scoreVariability = Math.sqrt(
      recentScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / recentScores.length
    );

    const avgResponseTime = responseTimeData.reduce((sum, time) => sum + time, 0) / responseTimeData.length;
    const avgRetention = retentionRates.reduce((sum, rate) => sum + rate, 0) / retentionRates.length;

    // Learning velocity calculation
    const recentTrend = recentScores.length >= 5 
      ? (recentScores.slice(-3).reduce((a, b) => a + b, 0) / 3) - 
        (recentScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3)
      : 0;

    const learningVelocity = recentTrend / Math.max(1, scoreVariability);

    // Difficulty adjustment logic
    let recommendedDifficulty = currentDifficulty;
    let adjustmentReason = 'No adjustment needed';

    // Performance-based adjustments
    if (avgScore >= 4.5 && avgRetention >= 0.85 && learningVelocity > 0.5) {
      // Student is excelling - increase difficulty
      const increment = config.aggressiveness === 'aggressive' ? 0.8 :
                       config.aggressiveness === 'moderate' ? 0.5 : 0.3;
      recommendedDifficulty = Math.min(5, currentDifficulty + increment);
      adjustmentReason = 'High performance - increasing difficulty to maintain challenge';
      
    } else if (avgScore <= 2.5 || avgRetention <= 0.6 || learningVelocity < -0.5) {
      // Student is struggling - decrease difficulty
      const decrement = config.aggressiveness === 'aggressive' ? 0.8 :
                       config.aggressiveness === 'moderate' ? 0.5 : 0.3;
      recommendedDifficulty = Math.max(1, currentDifficulty - decrement);
      adjustmentReason = 'Low performance - reducing difficulty to build confidence';
      
    } else if (avgResponseTime > 45 && avgScore >= 3.5) {
      // Taking too long but getting answers right - slight difficulty reduction
      recommendedDifficulty = Math.max(1, currentDifficulty - 0.2);
      adjustmentReason = 'Slow but accurate responses - minor difficulty reduction';
      
    } else if (avgResponseTime < 10 && avgScore >= 4) {
      // Very fast and accurate - can handle more difficulty
      recommendedDifficulty = Math.min(5, currentDifficulty + 0.3);
      adjustmentReason = 'Fast and accurate responses - increasing challenge';
    }

    // Apply adaptation speed modifier
    const adjustment = (recommendedDifficulty - currentDifficulty) * config.adaptationSpeed;
    recommendedDifficulty = currentDifficulty + adjustment;

    // Calculate confidence level
    const dataQuality = Math.min(1, recentScores.length / 10);
    const consistencyFactor = Math.max(0.1, 1 - (scoreVariability / 5));
    const confidenceLevel = dataQuality * consistencyFactor;

    return {
      flashcardId: '',
      currentDifficulty,
      recommendedDifficulty: Math.round(recommendedDifficulty * 10) / 10,
      adjustmentReason,
      confidenceLevel,
      learningVelocity
    };
  }, []);

  // Analyze flashcard performance for difficulty adjustment
  const analyzeFlashcardDifficulty = useCallback(async (
    flashcardId: string,
    config: DifficultyAdjustmentConfig = {
      aggressiveness: 'moderate',
      adaptationSpeed: 0.7,
      minimumDataPoints: 5
    }
  ) => {
    if (!user) return null;

    try {
      // Get recent performance data
      const { data: progressData } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId);

      const { data: learningData } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId);

      const { data: responseData } = await supabase
        .from('quiz_card_responses')
        .select('*')
        .eq('flashcard_id', flashcardId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!progressData?.[0] || !learningData?.[0]) return null;

      const progress = progressData[0];
      const learning = learningData[0];

      // Extract recent scores (last 20 responses)
      const recentScores = responseData?.map(response => 
        response.is_correct ? 5 : 1
      ) || [];

      // Extract response times
      const responseTimeData = responseData?.map(response => 
        response.response_time_seconds || 30
      ) || [];

      // Calculate retention rates
      const retentionRates = [learning.times_correct / Math.max(1, learning.times_seen)];

      // Get current difficulty from flashcard
      const { data: flashcardData } = await supabase
        .from('flashcards')
        .select('difficulty')
        .eq('id', flashcardId)
        .single();

      const currentDifficulty = flashcardData?.difficulty || 3;

      const metrics = calculateOptimalDifficulty(
        recentScores,
        responseTimeData,
        retentionRates,
        currentDifficulty,
        config
      );

      metrics.flashcardId = flashcardId;
      return metrics;

    } catch (error) {
      console.error('Error analyzing flashcard difficulty:', error);
      return null;
    }
  }, [user, calculateOptimalDifficulty]);

  // Apply difficulty adjustments to multiple flashcards
  const adjustFlashcardSetDifficulty = useCallback(async (
    flashcardIds: string[],
    config?: DifficultyAdjustmentConfig
  ) => {
    if (!user) return;

    setIsAdjusting(true);
    try {
      const adjustments = new Map<string, DifficultyMetrics>();

      for (const flashcardId of flashcardIds) {
        const metrics = await analyzeFlashcardDifficulty(flashcardId, config);
        if (metrics && Math.abs(metrics.recommendedDifficulty - metrics.currentDifficulty) > 0.1) {
          adjustments.set(flashcardId, metrics);
        }
      }

      // Apply difficulty adjustments to database
      for (const [flashcardId, metrics] of adjustments.entries()) {
        await supabase
          .from('flashcards')
          .update({
            difficulty: Math.round(metrics.recommendedDifficulty),
            updated_at: new Date().toISOString()
          })
          .eq('id', flashcardId);
      }

      setDifficultyMetrics(adjustments);
      console.log('Applied difficulty adjustments to', adjustments.size, 'flashcards');

    } catch (error) {
      console.error('Error adjusting flashcard difficulties:', error);
    } finally {
      setIsAdjusting(false);
    }
  }, [user, analyzeFlashcardDifficulty]);

  // Get difficulty recommendation for a specific flashcard
  const getDifficultyRecommendation = useCallback(async (flashcardId: string) => {
    return await analyzeFlashcardDifficulty(flashcardId);
  }, [analyzeFlashcardDifficulty]);

  return {
    difficultyMetrics,
    isAdjusting,
    analyzeFlashcardDifficulty,
    adjustFlashcardSetDifficulty,
    getDifficultyRecommendation,
    calculateOptimalDifficulty
  };
};

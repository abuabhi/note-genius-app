
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { PredictiveLearningData } from '@/types/advancedAnalytics';

export const usePredictiveLearning = () => {
  const { user } = useAuth();
  const [isCalculating, setIsCalculating] = useState(false);

  // Query cached predictions
  const { data: cachedPredictions, isLoading } = useQuery({
    queryKey: ['predictive-learning', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('predictive_analytics_cache')
        .select('prediction_data, accuracy_score, created_at')
        .eq('user_id', user.id)
        .eq('cache_key', 'predictive_learning')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      return data ? {
        ...(data.prediction_data as unknown as PredictiveLearningData),
        accuracy: data.accuracy_score,
        lastCalculated: data.created_at
      } : null;
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const calculatePredictions = async () => {
    if (!user?.id) return;
    
    setIsCalculating(true);
    try {
      console.log('🔮 Calculating predictive learning analytics...');

      // Get user's learning data
      const [sessionsData, progressData, goalsData] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .order('start_time', { ascending: false })
          .limit(50),
        
        supabase
          .from('user_flashcard_progress')
          .select('*, flashcards!inner(flashcard_sets!inner(subject))')
          .eq('user_id', user.id)
          .order('last_reviewed_at', { ascending: false })
          .limit(100),
        
        supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
      ]);

      const sessions = sessionsData.data || [];
      const progress = progressData.data || [];
      const goals = goalsData.data || [];

      // Calculate learning velocity (cards mastered per hour)
      const recentProgress = progress.filter(p => 
        new Date(p.last_reviewed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      const masteredCards = recentProgress.filter(p => p.mastery_level >= 4).length;
      const totalStudyTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600; // hours
      const learningVelocity = totalStudyTime > 0 ? masteredCards / totalStudyTime : 0;

      // Calculate difficulty progression
      const avgMastery = progress.length > 0 
        ? progress.reduce((acc, p) => acc + p.mastery_level, 0) / progress.length 
        : 1;
      const difficultyProgression = avgMastery > 3.5 ? 'optimal' : 
                                   avgMastery > 2.5 ? 'too_slow' : 'too_fast';

      // Calculate retention probability using spaced repetition principles
      const retentionScores = progress.map(p => {
        if (!p.last_reviewed_at) return 0.5;
        const daysSinceReview = (Date.now() - new Date(p.last_reviewed_at).getTime()) / (1000 * 60 * 60 * 24);
        const expectedInterval = Math.pow(2, p.mastery_level - 1);
        return Math.max(0, 1 - (daysSinceReview / expectedInterval));
      });
      const retentionProbability = retentionScores.length > 0 
        ? retentionScores.reduce((a, b) => a + b, 0) / retentionScores.length 
        : 0.5;

      // Analyze performance trend
      const recentSessions = sessions.slice(0, 10);
      const olderSessions = sessions.slice(10, 20);
      const recentAvgAccuracy = recentSessions.length > 0 
        ? recentSessions.reduce((acc, s) => acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / recentSessions.length
        : 0;
      const olderAvgAccuracy = olderSessions.length > 0 
        ? olderSessions.reduce((acc, s) => acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / olderSessions.length
        : 0;
      
      const performanceTrend = recentAvgAccuracy > olderAvgAccuracy + 0.1 ? 'improving' :
                              recentAvgAccuracy < olderAvgAccuracy - 0.1 ? 'declining' : 'stable';

      // Calculate weekly goal likelihood
      const currentWeeklyHours = sessions
        .filter(s => new Date(s.start_time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((acc, s) => acc + (s.duration || 0), 0) / 3600;
      const weeklyGoal = goals.find(g => g.target_hours)?.target_hours || 5;
      const weeklyGoalLikelihood = Math.min(1, currentWeeklyHours / weeklyGoal + (learningVelocity * 0.1));

      // Determine optimal study times based on session performance
      const sessionsByHour = sessions.reduce((acc, session) => {
        const hour = new Date(session.start_time).getHours();
        if (!acc[hour]) acc[hour] = [];
        acc[hour].push((session.cards_correct || 0) / Math.max(session.cards_reviewed || 1, 1));
        return acc;
      }, {} as Record<number, number[]>);

      const optimalStudyTimes = Object.entries(sessionsByHour)
        .map(([hour, accuracies]) => ({
          hour: parseInt(hour),
          avgAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length
        }))
        .sort((a, b) => b.avgAccuracy - a.avgAccuracy)
        .slice(0, 3)
        .map(({ hour }) => `${hour}:00-${hour + 1}:00`);

      // Calculate recommended break frequency
      const avgSessionDuration = sessions.length > 0 
        ? sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length 
        : 1800; // 30 minutes default
      const recommendedBreakFrequency = Math.max(15, Math.min(60, avgSessionDuration / 60)); // minutes

      const predictions: PredictiveLearningData = {
        learningVelocity,
        difficultyProgression,
        retentionProbability,
        performanceTrend,
        studyOutcomePrediction: {
          weeklyGoalLikelihood,
          optimalStudyTimes,
          recommendedBreakFrequency
        }
      };

      // Cache predictions
      await supabase
        .from('predictive_analytics_cache')
        .upsert({
          user_id: user.id,
          cache_key: 'predictive_learning',
          prediction_data: predictions as any,
          accuracy_score: retentionProbability,
          expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours
        });

      console.log('✅ Predictive analytics calculated:', predictions);
      return predictions;

    } catch (error) {
      console.error('Error calculating predictive learning:', error);
      throw error;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    predictions: cachedPredictions,
    calculatePredictions,
    isLoading,
    isCalculating
  };
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { AdvancedPerformanceMetrics } from '@/types/advancedAnalytics';

export const useAdvancedPerformanceMetrics = () => {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['advanced-performance-metrics', user?.id],
    queryFn: async (): Promise<AdvancedPerformanceMetrics | null> => {
      if (!user?.id) return null;

      console.log('📊 Calculating advanced performance metrics...');

      // Get comprehensive user data
      const [sessionsData, progressData, benchmarkData] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .order('start_time', { ascending: false })
          .limit(100),
        
        supabase
          .from('user_flashcard_progress')
          .select(`
            *,
            flashcards!inner(
              flashcard_sets!inner(subject, name)
            )
          `)
          .eq('user_id', user.id),
        
        supabase
          .from('performance_benchmarks')
          .select('*')
          .in('metric_type', ['avg_accuracy', 'study_velocity', 'retention_rate'])
      ]);

      const sessions = (sessionsData.data || []) as any[];
      const progress = (progressData.data || []) as any[];
      const benchmarks = benchmarkData.data || [];

      // Calculate cognitive load score (based on session complexity and duration)
      const cognitiveLoadScores = sessions.map(session => {
        const duration = session.duration || 0;
        const cardRate = (session.cards_reviewed || 0) / Math.max(duration / 60, 1); // cards per minute
        const accuracy = (session.cards_correct || 0) / Math.max(session.cards_reviewed || 1, 1);
        
        // Higher card rate with maintained accuracy = better cognitive load management
        return Math.min(1, (cardRate * accuracy) / 2);
      });
      const cognitiveLoadScore = cognitiveLoadScores.length > 0 
        ? cognitiveLoadScores.reduce((a, b) => a + b, 0) / cognitiveLoadScores.length 
        : 0.5;

      // Calculate learning efficiency (retention per time spent)
      const totalStudyTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600; // hours
      const masteredCards = progress.filter(p => p.mastery_level >= 4).length;
      const learningEfficiency = totalStudyTime > 0 ? masteredCards / totalStudyTime : 0;

      // Calculate subject mastery
      const subjectMastery: Record<string, number> = {};
      progress.forEach(p => {
        // Safe access to nested flashcard data
        const flashcardData = p.flashcards as any;
        const flashcardSet = flashcardData?.flashcard_sets;
        const subject = flashcardSet?.subject || (Array.isArray(flashcardSet) ? flashcardSet[0]?.subject : null) || 'General';
        
        if (!subjectMastery[subject]) {
          subjectMastery[subject] = [];
        }
        (subjectMastery[subject] as any).push(p.mastery_level);
      });

      Object.keys(subjectMastery).forEach(subject => {
        const levels = subjectMastery[subject] as any;
        if (Array.isArray(levels) && levels.length > 0) {
          subjectMastery[subject] = levels.reduce((a: number, b: number) => a + b, 0) / levels.length;
        } else {
          subjectMastery[subject] = 0;
        }
      });

      // Calculate comparative performance
      const userAccuracy = sessions.length > 0 
        ? sessions.reduce((acc, s) => acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / sessions.length
        : 0;
      
      const accuracyBenchmark = benchmarks.find(b => b.metric_type === 'avg_accuracy');
      const averagePeerPerformance = accuracyBenchmark?.metric_value || 0.7;
      const percentileRank = Math.min(99, Math.max(1, userAccuracy / averagePeerPerformance * 50));

      // Calculate learning acceleration (improvement rate over time)
      const recentSessions = sessions.slice(0, 20);
      const olderSessions = sessions.slice(20, 40);
      const recentPerformance = recentSessions.length > 0 
        ? recentSessions.reduce((acc, s) => acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / recentSessions.length
        : 0;
      const olderPerformance = olderSessions.length > 0 
        ? olderSessions.reduce((acc, s) => acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / olderSessions.length
        : 0;
      const learningAcceleration = recentPerformance - olderPerformance;

      // Calculate session quality score
      const sessionQualityScores = sessions.map(session => {
        const accuracy = (session.cards_correct || 0) / Math.max(session.cards_reviewed || 1, 1);
        const duration = session.duration || 0;
        const cardsPerMinute = (session.cards_reviewed || 0) / Math.max(duration / 60, 1);
        
        // Optimal duration (20-60 minutes), good accuracy (>0.7), reasonable pace
        const durationScore = duration >= 1200 && duration <= 3600 ? 1 : 0.7;
        const accuracyScore = accuracy >= 0.7 ? 1 : accuracy / 0.7;
        const paceScore = cardsPerMinute >= 0.5 && cardsPerMinute <= 2 ? 1 : 0.8;
        
        return (durationScore + accuracyScore + paceScore) / 3;
      });
      const sessionQualityScore = sessionQualityScores.length > 0 
        ? sessionQualityScores.reduce((a, b) => a + b, 0) / sessionQualityScores.length 
        : 0.5;

      const metrics: AdvancedPerformanceMetrics = {
        cognitiveLoadScore: Math.round(cognitiveLoadScore * 100) / 100,
        learningEfficiency: Math.round(learningEfficiency * 100) / 100,
        subjectMastery,
        comparativePerformance: {
          percentileRank: Math.round(percentileRank),
          averagePeerPerformance: Math.round(averagePeerPerformance * 100) / 100
        },
        learningAcceleration: Math.round(learningAcceleration * 1000) / 1000,
        sessionQualityScore: Math.round(sessionQualityScore * 100) / 100
      };

      console.log('✅ Advanced performance metrics calculated:', metrics);
      return metrics;
    },
    enabled: !!user?.id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    metrics,
    isLoading
  };
};

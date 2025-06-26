
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { ComparativeBenchmark } from '@/types/advancedAnalytics';

export const useComparativeBenchmarks = () => {
  const { user } = useAuth();

  const { data: benchmarks, isLoading } = useQuery({
    queryKey: ['comparative-benchmarks', user?.id],
    queryFn: async (): Promise<ComparativeBenchmark[]> => {
      if (!user?.id) return [];

      console.log('📈 Calculating comparative benchmarks...');

      // Get user's performance data
      const [userSessions, userProgress, benchmarkData] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .order('start_time', { ascending: false })
          .limit(50),
        
        supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id),
        
        supabase
          .from('performance_benchmarks')
          .select('*')
          .order('updated_at', { ascending: false })
      ]);

      const sessions = userSessions.data || [];
      const progress = userProgress.data || [];
      const allBenchmarks = benchmarkData.data || [];

      const comparisons: ComparativeBenchmark[] = [];

      // Study Time Comparison
      const userWeeklyHours = sessions
        .filter(s => new Date(s.start_time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((acc, s) => acc + (s.duration || 0), 0) / 3600;
      
      const weeklyHoursBenchmark = allBenchmarks.find(b => b.metric_type === 'weekly_study_hours');
      if (weeklyHoursBenchmark) {
        const percentile = Math.min(99, Math.max(1, (userWeeklyHours / weeklyHoursBenchmark.metric_value) * 50));
        comparisons.push({
          metric: 'Weekly Study Hours',
          userValue: Math.round(userWeeklyHours * 10) / 10,
          benchmarkValue: weeklyHoursBenchmark.metric_value,
          percentile: Math.round(percentile),
          trend: userWeeklyHours > weeklyHoursBenchmark.metric_value ? 'above' : 
                 userWeeklyHours < weeklyHoursBenchmark.metric_value * 0.8 ? 'below' : 'at'
        });
      }

      // Accuracy Comparison
      const userAccuracy = sessions.length > 0 
        ? sessions.reduce((acc, s) => acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / sessions.length
        : 0;
      
      const accuracyBenchmark = allBenchmarks.find(b => b.metric_type === 'avg_accuracy');
      if (accuracyBenchmark && userAccuracy > 0) {
        const percentile = Math.min(99, Math.max(1, (userAccuracy / accuracyBenchmark.metric_value) * 50));
        comparisons.push({
          metric: 'Flashcard Accuracy',
          userValue: Math.round(userAccuracy * 100),
          benchmarkValue: Math.round(accuracyBenchmark.metric_value * 100),
          percentile: Math.round(percentile),
          trend: userAccuracy > accuracyBenchmark.metric_value ? 'above' : 
                 userAccuracy < accuracyBenchmark.metric_value * 0.9 ? 'below' : 'at'
        });
      }

      // Learning Velocity Comparison
      const masteredCards = progress.filter(p => p.mastery_level >= 4).length;
      const totalStudyTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600;
      const userVelocity = totalStudyTime > 0 ? masteredCards / totalStudyTime : 0;
      
      const velocityBenchmark = allBenchmarks.find(b => b.metric_type === 'learning_velocity');
      if (velocityBenchmark && userVelocity > 0) {
        const percentile = Math.min(99, Math.max(1, (userVelocity / velocityBenchmark.metric_value) * 50));
        comparisons.push({
          metric: 'Learning Velocity',
          userValue: Math.round(userVelocity * 10) / 10,
          benchmarkValue: velocityBenchmark.metric_value,
          percentile: Math.round(percentile),
          trend: userVelocity > velocityBenchmark.metric_value ? 'above' : 
                 userVelocity < velocityBenchmark.metric_value * 0.8 ? 'below' : 'at'
        });
      }

      // Retention Rate Comparison
      const recentProgress = progress.filter(p => 
        p.last_reviewed_at && new Date(p.last_reviewed_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      const retainedCards = recentProgress.filter(p => p.mastery_level >= 3).length;
      const userRetentionRate = recentProgress.length > 0 ? retainedCards / recentProgress.length : 0;
      
      const retentionBenchmark = allBenchmarks.find(b => b.metric_type === 'retention_rate');
      if (retentionBenchmark && userRetentionRate > 0) {
        const percentile = Math.min(99, Math.max(1, (userRetentionRate / retentionBenchmark.metric_value) * 50));
        comparisons.push({
          metric: 'Retention Rate',
          userValue: Math.round(userRetentionRate * 100),
          benchmarkValue: Math.round(retentionBenchmark.metric_value * 100),
          percentile: Math.round(percentile),
          trend: userRetentionRate > retentionBenchmark.metric_value ? 'above' : 
                 userRetentionRate < retentionBenchmark.metric_value * 0.9 ? 'below' : 'at'
        });
      }

      // Session Consistency Comparison
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });

      const studyDays = new Set(sessions
        .filter(s => new Date(s.start_time) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .map(s => s.start_time.split('T')[0])
      );

      const userConsistency = studyDays.size / 30;
      const consistencyBenchmark = allBenchmarks.find(b => b.metric_type === 'study_consistency');
      if (consistencyBenchmark) {
        const percentile = Math.min(99, Math.max(1, (userConsistency / consistencyBenchmark.metric_value) * 50));
        comparisons.push({
          metric: 'Study Consistency',
          userValue: Math.round(userConsistency * 100),
          benchmarkValue: Math.round(consistencyBenchmark.metric_value * 100),
          percentile: Math.round(percentile),
          trend: userConsistency > consistencyBenchmark.metric_value ? 'above' : 
                 userConsistency < consistencyBenchmark.metric_value * 0.8 ? 'below' : 'at'
        });
      }

      // If no benchmarks exist, create default ones
      if (allBenchmarks.length === 0 && sessions.length > 0) {
        await supabase
          .from('performance_benchmarks')
          .insert([
            { subject_name: 'General', metric_type: 'weekly_study_hours', metric_value: 5.0, sample_size: 1 },
            { subject_name: 'General', metric_type: 'avg_accuracy', metric_value: 0.75, sample_size: 1 },
            { subject_name: 'General', metric_type: 'learning_velocity', metric_value: 8.0, sample_size: 1 },
            { subject_name: 'General', metric_type: 'retention_rate', metric_value: 0.80, sample_size: 1 },
            { subject_name: 'General', metric_type: 'study_consistency', metric_value: 0.60, sample_size: 1 }
          ]);
      }

      console.log('✅ Comparative benchmarks calculated:', comparisons.length);
      return comparisons;
    },
    enabled: !!user?.id,
    staleTime: 20 * 60 * 1000, // 20 minutes
  });

  return {
    benchmarks: benchmarks || [],
    isLoading
  };
};

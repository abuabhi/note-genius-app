
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getFallbackSubjectAnalytics, getFallbackRecommendations } from '@/utils/subjectAnalyticsUtils';
import { useMemo } from 'react';

export interface UnifiedSubjectAnalytics {
  subject_name: string;
  subject_id: string | null;
  flashcard_sets_count: number;
  total_flashcards: number;
  mastered_flashcards: number;
  flashcard_accuracy: number;
  quiz_attempts: number;
  quiz_avg_score: number;
  study_sessions_count: number;
  total_study_minutes: number;
  notes_count: number;
  last_activity_date: string | null;
  learning_velocity: number;
  completion_percentage: number;
  color: 'green' | 'yellow' | 'red';
}

export interface SubjectRecommendation {
  subject_name: string;
  recommendation_type: string;
  priority: 'high' | 'medium' | 'low';
  message: string;
  action_items: string[];
}

export interface EnhancedSubjectAnalytics {
  subjects: UnifiedSubjectAnalytics[];
  recommendations: SubjectRecommendation[];
  totalStudyTime: number; // All-time total in hours
  thirtyDayStudyTime: number; // Last 30 days in hours  
  sevenDayStudyTime: number; // Last 7 days in hours
  sessionsThisWeek: number;
  averageScore: number;
  longestStreak: number;
}

export const useUnifiedSubjectAnalytics = () => {
  const { user } = useAuth();

  // Fetch raw analytics data
  const { data: rawAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['unified-subject-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🔍 Fetching unified subject analytics');

      try {
        // Try using the database function first with proper typing
        const { data, error } = await supabase.rpc(
          'get_unified_subject_analytics' as any,
          { p_user_id: user.id }
        ) as { data: any[] | null; error: any };

        if (error) {
          console.log('⚠️ Database function not available, using fallback method:', error.message);
          return await getFallbackSubjectAnalytics(user.id);
        }

        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.log('⚠️ Database function failed, using fallback method:', error);
        return await getFallbackSubjectAnalytics(user.id);
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 5 * 60 * 1000, // 5 minutes memory retention
  });

  // Fetch recommendations
  const { data: rawRecommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['subject-recommendations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🎯 Fetching subject recommendations');

      try {
        // Try using the database function first with proper typing
        const { data, error } = await supabase.rpc(
          'get_subject_recommendations' as any,
          { p_user_id: user.id }
        ) as { data: any[] | null; error: any };

        if (error) {
          console.log('⚠️ Recommendations function not available, using fallback method');
          return getFallbackRecommendations(Array.isArray(rawAnalytics) ? rawAnalytics : []);
        }

        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.log('⚠️ Recommendations function failed, using fallback method');
        return getFallbackRecommendations(Array.isArray(rawAnalytics) ? rawAnalytics : []);
      }
    },
    enabled: !!user && !!rawAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes memory retention
  });

  // Fetch basic stats with three time periods
  const { data: basicStats, isLoading: statsLoading } = useQuery({
    queryKey: ['subject-basic-stats', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('📊 Fetching basic study statistics with multiple time periods');

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Query all three time periods in parallel
      const [totalTimeQuery, thirtyDayQuery, sevenDayQuery, sessionsQuery] = await Promise.all([
        // Total study time (all time)
        supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .not('duration', 'is', null),
        
        // Last 30 days study time
        supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .gte('start_time', thirtyDaysAgo.toISOString())
          .not('duration', 'is', null),
        
        // Last 7 days study time
        supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .gte('start_time', sevenDaysAgo.toISOString())
          .not('duration', 'is', null),
        
        // Sessions this week count
        supabase
          .from('study_sessions')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('start_time', sevenDaysAgo.toISOString())
      ]);

      // Calculate total study times in hours
      const totalStudyTimeSeconds = totalTimeQuery.data?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
      const thirtyDayStudyTimeSeconds = thirtyDayQuery.data?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
      const sevenDayStudyTimeSeconds = sevenDayQuery.data?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;

      // Convert seconds to hours (rounded to 1 decimal place)
      const totalStudyTime = Math.round((totalStudyTimeSeconds / 3600) * 10) / 10;
      const thirtyDayStudyTime = Math.round((thirtyDayStudyTimeSeconds / 3600) * 10) / 10;
      const sevenDayStudyTime = Math.round((sevenDayStudyTimeSeconds / 3600) * 10) / 10;

      const sessionsThisWeek = sessionsQuery.count || 0;

      // Calculate basic metrics (simplified for now)
      const averageScore = 75; // Placeholder - will be calculated from subjects
      const longestStreak = 5; // Placeholder - will be enhanced later

      console.log('✅ Basic stats calculated:', {
        totalStudyTime,
        thirtyDayStudyTime,
        sevenDayStudyTime,
        sessionsThisWeek
      });

      return {
        totalStudyTime,
        thirtyDayStudyTime,
        sevenDayStudyTime,
        sessionsThisWeek,
        averageScore,
        longestStreak
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 5 * 60 * 1000, // 5 minutes memory retention
  });

  // Process and combine all data
  const enhancedAnalytics = useMemo((): EnhancedSubjectAnalytics => {
    // Return loading state structure
    if (!basicStats || !Array.isArray(rawAnalytics)) {
      return {
        subjects: [],
        recommendations: [],
        totalStudyTime: 0,
        thirtyDayStudyTime: 0,
        sevenDayStudyTime: 0,
        sessionsThisWeek: 0,
        averageScore: 0,
        longestStreak: 0
      };
    }

    const subjects: UnifiedSubjectAnalytics[] = rawAnalytics.map((subject: any) => {
      // Calculate completion percentage based on multiple factors
      const flashcardWeight = 0.4;
      const quizWeight = 0.4;
      const activityWeight = 0.2;

      const flashcardScore = subject.total_flashcards > 0 
        ? (subject.mastered_flashcards / subject.total_flashcards) * 100 
        : 0;
      
      const quizScore = subject.quiz_avg_score || 0;
      
      const activityScore = Math.min(
        (subject.study_sessions_count * 10) + (subject.notes_count * 5), 
        100
      );

      const completionPercentage = Math.round(
        (flashcardScore * flashcardWeight) +
        (quizScore * quizWeight) +
        (activityScore * activityWeight)
      );

      // Assign color based on completion
      let color: 'green' | 'yellow' | 'red' = 'red';
      if (completionPercentage >= 85) {
        color = 'green';
      } else if (completionPercentage >= 60) {
        color = 'yellow';
      }

      return {
        subject_name: subject.subject_name,
        subject_id: subject.subject_id,
        flashcard_sets_count: subject.flashcard_sets_count,
        total_flashcards: subject.total_flashcards,
        mastered_flashcards: subject.mastered_flashcards,
        flashcard_accuracy: subject.flashcard_accuracy,
        quiz_attempts: subject.quiz_attempts,
        quiz_avg_score: subject.quiz_avg_score,
        study_sessions_count: subject.study_sessions_count,
        total_study_minutes: subject.total_study_minutes,
        notes_count: subject.notes_count,
        last_activity_date: subject.last_activity_date,
        learning_velocity: subject.learning_velocity,
        completion_percentage: completionPercentage,
        color
      };
    }).sort((a, b) => b.completion_percentage - a.completion_percentage);

    // Ensure rawRecommendations is an array before processing
    const recommendations: SubjectRecommendation[] = Array.isArray(rawRecommendations) 
      ? rawRecommendations.map((rec: any) => ({
          subject_name: rec.subject_name,
          recommendation_type: rec.recommendation_type,
          priority: rec.priority as 'high' | 'medium' | 'low',
          message: rec.message,
          action_items: Array.isArray(rec.action_items) ? rec.action_items : []
        }))
      : [];

    // Calculate average score from subjects
    const averageScore = subjects.length > 0 
      ? Math.round(subjects.reduce((sum, s) => sum + s.quiz_avg_score, 0) / subjects.length)
      : basicStats.averageScore;

    return {
      subjects,
      recommendations,
      totalStudyTime: basicStats.totalStudyTime,
      thirtyDayStudyTime: basicStats.thirtyDayStudyTime,
      sevenDayStudyTime: basicStats.sevenDayStudyTime,
      sessionsThisWeek: basicStats.sessionsThisWeek,
      averageScore,
      longestStreak: basicStats.longestStreak
    };
  }, [rawAnalytics, rawRecommendations, basicStats]);

  return {
    enhancedAnalytics,
    isLoading: analyticsLoading || recommendationsLoading || statsLoading
  };
};

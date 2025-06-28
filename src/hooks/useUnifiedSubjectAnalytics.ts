
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import { getFallbackSubjectAnalytics, getFallbackRecommendations } from '@/utils/subjectAnalyticsUtils';

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
  totalStudyTime: number;
  sessionsThisWeek: number;
  averageScore: number;
  longestStreak: number;
}

export const useUnifiedSubjectAnalytics = () => {
  const { user } = useAuth();

  // Fetch unified subject analytics using the database function with fallback
  const { data: rawAnalytics, isLoading: isAnalyticsLoading } = useQuery({
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes memory retention
  });

  // Fetch subject recommendations with fallback
  const { data: rawRecommendations, isLoading: isRecommendationsLoading } = useQuery({
    queryKey: ['subject-recommendations', user?.id, rawAnalytics],
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
  });

  // Fetch basic stats for compatibility
  const { data: basicStats } = useQuery({
    queryKey: ['basic-stats', user?.id],
    queryFn: async () => {
      if (!user) return { totalStudyTime: 0, sessionsThisWeek: 0, averageScore: 0, longestStreak: 0 };

      const [sessionsResult, streakResult] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('duration')
          .eq('user_id', user.id)
          .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .not('duration', 'is', null),
        
        supabase
          .from('study_sessions')
          .select('start_time')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(30)
      ]);

      const weeklyMinutes = sessionsResult.data?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
      const sessionsThisWeek = sessionsResult.data?.length || 0;

      // Calculate streak (simplified)
      const sessions = streakResult.data || [];
      const uniqueDates = [...new Set(sessions.map(s => new Date(s.start_time).toDateString()))];
      const streak = Math.min(uniqueDates.length, 7); // Max 7 days for week view

      return {
        totalStudyTime: weeklyMinutes / 60, // Convert to hours
        sessionsThisWeek,
        averageScore: 0, // Will be calculated from subject data
        longestStreak: streak
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Process and enhance the analytics data
  const enhancedAnalytics = useMemo((): EnhancedSubjectAnalytics => {
    if (!rawAnalytics || !rawRecommendations || !basicStats) {
      return {
        subjects: [],
        recommendations: [],
        totalStudyTime: 0,
        sessionsThisWeek: 0,
        averageScore: 0,
        longestStreak: 0
      };
    }

    // Ensure rawAnalytics is an array before processing
    if (!Array.isArray(rawAnalytics)) {
      console.warn('Raw analytics is not an array:', rawAnalytics);
      return {
        subjects: [],
        recommendations: [],
        totalStudyTime: basicStats.totalStudyTime,
        sessionsThisWeek: basicStats.sessionsThisWeek,
        averageScore: basicStats.averageScore,
        longestStreak: basicStats.longestStreak
      };
    }

    const subjects: UnifiedSubjectAnalytics[] = rawAnalytics.map((subject: any) => {
      // Calculate completion percentage based on multiple factors
      const flashcardWeight = 0.4;
      const quizWeight = 0.4;
      const activityWeight = 0.2;

      const flashcardScore = subject.total_flashcards > 0 
        ? (subject.mastered_flashcards / subject.total_flashcards) * 100 
        : subject.flashcard_accuracy;
      
      const quizScore = subject.quiz_avg_score || 0;
      
      const activityScore = subject.last_activity_date 
        ? Math.max(0, 100 - (new Date().getTime() - new Date(subject.last_activity_date).getTime()) / (1000 * 60 * 60 * 24) * 2)
        : 0;

      const completionPercentage = Math.round(
        (flashcardScore * flashcardWeight) +
        (quizScore * quizWeight) +
        (activityScore * activityWeight)
      );

      // Assign color based on completion and performance
      let color: 'green' | 'yellow' | 'red' = 'red';
      if (completionPercentage >= 85 && subject.flashcard_accuracy >= 80) {
        color = 'green';
      } else if (completionPercentage >= 60 || subject.flashcard_accuracy >= 65) {
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
      ? subjects.reduce((sum, s) => sum + s.quiz_avg_score, 0) / subjects.length 
      : 0;

    return {
      subjects,
      recommendations,
      totalStudyTime: basicStats.totalStudyTime,
      sessionsThisWeek: basicStats.sessionsThisWeek,
      averageScore: Math.round(averageScore),
      longestStreak: basicStats.longestStreak
    };
  }, [rawAnalytics, rawRecommendations, basicStats]);

  return {
    subjectAnalytics: enhancedAnalytics,
    isLoading: isAnalyticsLoading || isRecommendationsLoading
  };
};

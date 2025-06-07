
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOptimizedProgress = () => {
  // Load basic progress data first
  const { data: basicProgress, isLoading: basicLoading } = useQuery({
    queryKey: ['progress', 'basic'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const today = new Date().toISOString().split('T')[0];
      
      const [todayAnalytics, weeklyGoals] = await Promise.all([
        supabase
          .from('study_analytics')
          .select('total_study_time, flashcard_accuracy, consistency_score')
          .eq('user_id', userId)
          .eq('date', today)
          .single(),
        supabase
          .from('study_goals')
          .select('id, title, progress, target_hours, end_date')
          .eq('user_id', userId)
          .eq('is_completed', false)
          .limit(3)
      ]);

      return {
        todayStats: todayAnalytics.data,
        activeGoals: weeklyGoals.data || []
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  // Load detailed analytics second (for charts)
  const { data: detailedAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['progress', 'analytics'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [weeklyData, monthlyData, achievements] = await Promise.all([
        supabase
          .from('study_analytics')
          .select('date, total_study_time, flashcard_accuracy, subjects_studied')
          .eq('user_id', userId)
          .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('date', { ascending: true }),
        supabase
          .from('study_analytics')
          .select('date, total_study_time, flashcard_accuracy, learning_velocity')
          .eq('user_id', userId)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: true }),
        supabase
          .from('study_achievements')
          .select('title, description, achieved_at, points, badge_image')
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false })
          .limit(5)
      ]);

      return {
        weeklyProgress: weeklyData.data || [],
        monthlyProgress: monthlyData.data || [],
        recentAchievements: achievements.data || []
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!basicProgress, // Load after basic data
  });

  // Load flashcard progress last (heavy query)
  const { data: flashcardProgress, isLoading: flashcardLoading } = useQuery({
    queryKey: ['progress', 'flashcards'],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { data } = await supabase
        .from('user_flashcard_progress')
        .select(`
          id, mastery_level, last_score, grade,
          flashcard_id,
          flashcards!inner(
            front_content,
            flashcard_set_cards!inner(
              flashcard_sets!inner(name, subject)
            )
          )
        `)
        .eq('user_id', userId)
        .order('last_reviewed_at', { ascending: false })
        .limit(20);

      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!detailedAnalytics, // Load last
  });

  const progressData = useMemo(() => ({
    basic: basicProgress || { todayStats: null, activeGoals: [] },
    analytics: detailedAnalytics || { weeklyProgress: [], monthlyProgress: [], recentAchievements: [] },
    flashcards: flashcardProgress || []
  }), [basicProgress, detailedAnalytics, flashcardProgress]);

  return {
    data: progressData,
    isLoading: basicLoading,
    isPartiallyLoaded: !!basicProgress,
    loadingStates: {
      basic: basicLoading,
      analytics: analyticsLoading,
      flashcards: flashcardLoading
    }
  };
};

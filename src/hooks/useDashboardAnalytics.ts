
import { useUltraSimpleAnalytics } from './useUltraSimpleAnalytics';
import { useUserSubjects } from './useUserSubjects';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useMemo } from 'react';

export const useDashboardAnalytics = () => {
  const { analytics, isLoading: analyticsLoading } = useUltraSimpleAnalytics();
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();
  const { user } = useAuth();

  // Fetch subject-specific analytics
  const { data: subjectAnalytics, isLoading: subjectAnalyticsLoading } = useQuery({
    queryKey: ['subject-analytics', user?.id, userSubjects],
    queryFn: async () => {
      if (!user?.id || !userSubjects?.length) return [];

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Fetch study sessions by subject
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('subject, duration, start_time')
        .eq('user_id', user.id)
        .gte('start_time', sevenDaysAgo.toISOString());

      // Fetch flashcard progress by subject via a different approach
      const { data: flashcardData } = await supabase
        .from('flashcard_sets')
        .select('id, subject')
        .eq('user_id', user.id);

      const { data: progressData } = await supabase
        .from('user_flashcard_progress')
        .select('flashcard_id, mastery_level, last_reviewed_at')
        .eq('user_id', user.id);

      // Join the data manually
      const flashcardsBySubject = (flashcardData || []).reduce((acc: any, set) => {
        if (!acc[set.subject]) acc[set.subject] = [];
        acc[set.subject].push(set);
        return acc;
      }, {});

      const progressByFlashcard = (progressData || []).reduce((acc: any, progress) => {
        acc[progress.flashcard_id] = progress;
        return acc;
      }, {});

      return userSubjects.map(subject => {
        // Calculate study time for this subject
        const subjectSessions = (sessions || []).filter(s => s.subject === subject.name);
        const last7DaysTime = Math.round(
          subjectSessions.reduce((total, s) => total + (s.duration || 0), 0) / 60
        );

        // Calculate mastery progress for this subject
        const subjectFlashcardSets = flashcardsBySubject[subject.name] || [];
        let masteredCards = 0;
        let totalCards = 0;

        subjectFlashcardSets.forEach((set: any) => {
          const setProgress = Object.values(progressByFlashcard).filter((p: any) => 
            // This would need flashcard set relationship - simplified for now
            true
          );
          const setMastered = setProgress.filter((p: any) => p.mastery_level >= 3).length;
          masteredCards += setMastered;
          totalCards += setProgress.length;
        });

        const completionPercentage = totalCards > 0 
          ? Math.round((masteredCards / totalCards) * 100)
          : last7DaysTime > 0 ? Math.min(50, last7DaysTime) : 0;

        return {
          name: subject.name,
          completionPercentage,
          last7DaysTime,
          sessionsCount: subjectSessions.length
        };
      }).filter(subject => subject.completionPercentage > 0 || subject.last7DaysTime > 0);
    },
    enabled: !!user?.id && !!userSubjects?.length,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = analyticsLoading || subjectsLoading || subjectAnalyticsLoading;

  const todaysActivity = {
    cardsReviewed: 0,
    studyTime: analytics.todayStudyTimeMinutes,
    quizzesTaken: 0
  };

  const currentStreak = analytics.streakDays;

  // Calculate trend based on percentage change
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (analytics.weeklyChange > 5) {
    trend = 'up';
  } else if (analytics.weeklyChange < -5) {
    trend = 'down';
  }

  const weeklyComparison = {
    thisWeek: analytics.weeklyStudyTimeMinutes,
    lastWeek: analytics.previousWeekTimeMinutes,
    trend,
    percentageChange: analytics.weeklyChange
  };

  // Use dynamic subject data from user settings
  const subjects = subjectAnalytics || [];

  const dashboardData = {
    totalSessions: analytics.totalSessions,
    totalStudyTime: analytics.totalStudyTime,
    totalStudyTimeMinutes: analytics.totalStudyTimeMinutes,
    todayStudyTimeMinutes: analytics.todayStudyTimeMinutes,
    weeklyStudyTimeMinutes: analytics.weeklyStudyTimeMinutes,
    totalCardsMastered: analytics.totalCardsMastered,
    flashcardAccuracy: analytics.flashcardAccuracy,
    todaysActivity,
    currentStreak,
    weeklyComparison,
    weeklyGoalProgress: analytics.weeklyGoalProgress,
    weeklyGoalHours: analytics.weeklyGoalHours,
    subjects,
    isLoading
  };

  return dashboardData;
};

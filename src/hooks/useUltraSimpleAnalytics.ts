
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface SubjectAnalytics {
  name: string;
  completionPercentage: number;
  studyTimeMinutes: number;
  last7DaysTime: number;
  flashcardSetsCount: number;
  totalCards: number;
  masteredCards: number;
  lastActivity: string | null;
}

export interface UltraSimpleAnalytics {
  totalSessions: number;
  activeSessions: number;
  totalStudyTime: number;
  totalStudyTimeMinutes: number;
  todayStudyTimeMinutes: number;
  weeklyStudyTimeMinutes: number;
  averageSessionTime: number;
  totalCardsReviewed: number;
  totalCardsCorrect: number;
  averageAccuracy: number;
  totalQuizzesTaken: number;
  streakDays: number;
  weeklyChange: number;
  recentSessions: any[];
  todaySessions: number;
  weeklySessions: number;
  flashcardAccuracy: number;
  totalCardsMastered: number;
  totalSets: number;
  previousWeekTimeMinutes: number;
  weeklyGoalProgress: number;
  weeklyGoalHours: number;
  subjects: SubjectAnalytics[];
}

export const useUltraSimpleAnalytics = () => {
  const { user } = useAuth();

  console.log('📊 [ULTRA SIMPLE ANALYTICS] Loading with subject data for suggestions');

  // Query for study sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["ultra-simple-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('auto_created', false)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Query for flashcard sets and progress
  const { data: flashcardData = [], isLoading: flashcardLoading } = useQuery({
    queryKey: ["ultra-simple-flashcards", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const [setsResult, progressResult] = await Promise.all([
        supabase
          .from('flashcard_sets')
          .select('id, name, subject, card_count')
          .eq('user_id', user.id),
        supabase
          .from('user_flashcard_progress')
          .select('flashcard_id, mastery_level, last_reviewed_at')
          .eq('user_id', user.id)
      ]);

      return {
        sets: setsResult.data || [],
        progress: progressResult.data || []
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Query for user subjects
  const { data: userSubjects = [] } = useQuery({
    queryKey: ["user-subjects", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_subjects')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  const analytics = useMemo((): UltraSimpleAnalytics => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const todaySessions = sessions.filter(s => new Date(s.start_time) >= today);
    const weeklySessions = sessions.filter(s => new Date(s.start_time) >= weekAgo);
    const previousWeekSessions = sessions.filter(s => 
      new Date(s.start_time) >= twoWeeksAgo && new Date(s.start_time) < weekAgo
    );
    
    const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const todayMinutes = todaySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const weeklyMinutes = weeklySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const previousWeekMinutes = previousWeekSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    
    const totalHours = Math.round(totalMinutes * 10) / 10;
    const averageDuration = completedSessions.length ? Math.round((totalMinutes * 60) / completedSessions.length) : 0;
    
    const totalCardsReviewed = sessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
    const totalCardsCorrect = sessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
    const averageAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;
    
    // Calculate weekly change
    const weeklyChange = previousWeekMinutes > 0 
      ? Math.round(((weeklyMinutes - previousWeekMinutes) / previousWeekMinutes) * 100)
      : 0;

    // Calculate subjects analytics
    const subjectMap = new Map<string, SubjectAnalytics>();
    
    // Initialize with user subjects
    userSubjects.forEach(subject => {
      subjectMap.set(subject.name, {
        name: subject.name,
        completionPercentage: 50, // Default starting point
        studyTimeMinutes: 0,
        last7DaysTime: 0,
        flashcardSetsCount: 0,
        totalCards: 0,
        masteredCards: 0,
        lastActivity: null
      });
    });

    // Add flashcard data
    if (flashcardData.sets) {
      flashcardData.sets.forEach(set => {
        if (set.subject) {
          const existing = subjectMap.get(set.subject) || {
            name: set.subject,
            completionPercentage: 50,
            studyTimeMinutes: 0,
            last7DaysTime: 0,
            flashcardSetsCount: 0,
            totalCards: 0,
            masteredCards: 0,
            lastActivity: null
          };

          existing.flashcardSetsCount += 1;
          existing.totalCards += set.card_count || 0;
          subjectMap.set(set.subject, existing);
        }
      });
    }

    // Add session data
    sessions.forEach(session => {
      if (session.subject) {
        const existing = subjectMap.get(session.subject);
        if (existing) {
          const sessionMinutes = Math.floor((session.duration || 0) / 60);
          existing.studyTimeMinutes += sessionMinutes;

          // Check if session is in last 7 days
          const sessionDate = new Date(session.start_time);
          if (sessionDate >= weekAgo) {
            existing.last7DaysTime += sessionMinutes;
          }

          // Update last activity
          const activityDate = session.start_time.split('T')[0];
          if (!existing.lastActivity || activityDate > existing.lastActivity) {
            existing.lastActivity = activityDate;
          }

          // Calculate completion percentage based on study time and activity
          if (existing.studyTimeMinutes > 0) {
            existing.completionPercentage = Math.min(90, 30 + (existing.studyTimeMinutes / 10));
          }
        }
      }
    });

    // Add mastered cards from progress data
    if (flashcardData.progress) {
      flashcardData.progress.forEach(progress => {
        if (progress.mastery_level >= 3) {
          // Find which subject this card belongs to
          const cardSet = flashcardData.sets?.find(set => 
            set.id === progress.flashcard_id // This might need adjustment based on data structure
          );
          if (cardSet?.subject) {
            const existing = subjectMap.get(cardSet.subject);
            if (existing) {
              existing.masteredCards += 1;
            }
          }
        }
      });
    }

    const subjects = Array.from(subjectMap.values()).filter(s => 
      s.flashcardSetsCount > 0 || s.studyTimeMinutes > 0
    );

    // Calculate streak days (simplified)
    const studyDates = [...new Set(sessions.map(s => s.start_time.split('T')[0]))].sort().reverse();
    let streakDays = 0;
    const todayStr = today.toISOString().split('T')[0];
    
    if (studyDates.includes(todayStr)) {
      streakDays = 1;
      for (let i = 1; i < studyDates.length; i++) {
        const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (studyDates.includes(expectedDate)) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    const weeklyGoalHours = 5; // Default goal
    const weeklyGoalMinutes = weeklyGoalHours * 60;
    const weeklyGoalProgress = weeklyMinutes > 0 
      ? Math.min(100, Math.round((weeklyMinutes / weeklyGoalMinutes) * 100))
      : 0;

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.is_active).length,
      totalStudyTime: totalHours,
      totalStudyTimeMinutes: Math.round(totalMinutes),
      todayStudyTimeMinutes: Math.round(todayMinutes),
      weeklyStudyTimeMinutes: Math.round(weeklyMinutes),
      averageSessionTime: averageDuration,
      totalCardsReviewed,
      totalCardsCorrect,
      averageAccuracy,
      totalQuizzesTaken: sessions.filter(s => (s.quiz_total_questions || 0) > 0).length,
      streakDays,
      weeklyChange,
      recentSessions: sessions.slice(0, 10),
      todaySessions: todaySessions.length,
      weeklySessions: weeklySessions.length,
      flashcardAccuracy: averageAccuracy,
      totalCardsMastered: flashcardData.progress?.filter(p => p.mastery_level >= 3).length || 0,
      totalSets: flashcardData.sets?.length || 0,
      previousWeekTimeMinutes: Math.round(previousWeekMinutes),
      weeklyGoalProgress,
      weeklyGoalHours,
      subjects
    };
  }, [sessions, flashcardData, userSubjects]);

  const isLoading = sessionsLoading || flashcardLoading;

  return {
    analytics,
    isLoading
  };
};


import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface SubjectAnalytics {
  name: string;
  studyTimeMinutes: number;
  completionPercentage: number;
  recentActivity: boolean;
  cardCount: number;
  masteredCards: number;
  noteCount: number;
  lastStudied: string | null;
}

export interface UltraSimpleAnalytics {
  totalSessions: number;
  totalStudyTime: number;
  totalStudyTimeMinutes: number;
  todayStudyTime: number;
  todayStudyTimeMinutes: number;
  weeklyStudyTimeMinutes: number;
  averageSessionTime: number;
  totalCardsReviewed: number;
  totalCardsCorrect: number;
  averageAccuracy: number;
  totalQuizzesTaken: number;
  streakDays: number;
  totalSets: number;
  totalCardsMastered: number;
  totalNotes: number;
  subjects: SubjectAnalytics[];
}

export const useUltraSimpleAnalytics = () => {
  const { user } = useAuth();

  console.log('📊 [ULTRA SIMPLE ANALYTICS] Fetching comprehensive analytics data');

  // Query for study sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["simple-sessions", user?.id],
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

  // Query for user subjects
  const { data: userSubjects = [], isLoading: subjectsLoading } = useQuery({
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
    staleTime: 5 * 60 * 1000,
  });

  // Query for notes
  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["user-notes", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notes')
        .select('id, subject, created_at')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Query for flashcard data
  const { data: flashcardData, isLoading: flashcardLoading } = useQuery({
    queryKey: ["flashcard-analytics", user?.id],
    queryFn: async () => {
      if (!user) return { sets: [], progress: [] };

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

      if (setsResult.error) throw setsResult.error;
      if (progressResult.error) throw progressResult.error;

      return {
        sets: setsResult.data || [],
        progress: progressResult.data || []
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const analytics = useMemo((): UltraSimpleAnalytics => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const completedSessions = sessions.filter(s => !s.is_active && s.duration);
    const todaySessions = sessions.filter(s => new Date(s.start_time) >= today);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklySessions = sessions.filter(s => new Date(s.start_time) >= weekAgo);
    
    const totalMinutes = completedSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const todayMinutes = todaySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    const weeklyMinutes = weeklySessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60;
    
    const totalHours = Math.round(totalMinutes * 10) / 10;
    const todayHours = Math.round(todayMinutes * 10) / 10;
    const averageDuration = completedSessions.length ? Math.round(totalMinutes / completedSessions.length) : 0;
    
    const totalCardsReviewed = sessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0);
    const totalCardsCorrect = sessions.reduce((acc, s) => acc + (s.cards_correct || 0), 0);
    const averageAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;
    
    const totalQuizzesTaken = sessions.filter(s => (s.quiz_total_questions || 0) > 0).length;
    
    // Calculate streak
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

    // Safely access flashcard data
    const sets = flashcardData?.sets || [];
    const progress = flashcardData?.progress || [];
    
    const totalSets = sets.length;
    const masteredCards = progress.filter(p => p.mastery_level >= 3).length;

    // Calculate subject analytics
    const subjectMap = new Map<string, {
      studyTimeMinutes: number;
      cardCount: number;
      masteredCards: number;
      noteCount: number;
      lastStudied: string | null;
    }>();

    // Initialize subjects from user_subjects table
    userSubjects.forEach(subject => {
      subjectMap.set(subject.name, {
        studyTimeMinutes: 0,
        cardCount: 0,
        masteredCards: 0,
        noteCount: 0,
        lastStudied: null
      });
    });

    // Add study time from sessions
    sessions.forEach(session => {
      if (session.subject && session.duration) {
        const existing = subjectMap.get(session.subject) || {
          studyTimeMinutes: 0,
          cardCount: 0,
          masteredCards: 0,
          noteCount: 0,
          lastStudied: null
        };
        
        existing.studyTimeMinutes += session.duration / 60;
        existing.lastStudied = session.start_time;
        subjectMap.set(session.subject, existing);
      }
    });

    // Add flashcard data
    sets.forEach(set => {
      if (set.subject) {
        const existing = subjectMap.get(set.subject) || {
          studyTimeMinutes: 0,
          cardCount: 0,
          masteredCards: 0,
          noteCount: 0,
          lastStudied: null
        };
        
        existing.cardCount += set.card_count || 0;
        subjectMap.set(set.subject, existing);
      }
    });

    // Add note count
    notes.forEach(note => {
      if (note.subject) {
        const existing = subjectMap.get(note.subject) || {
          studyTimeMinutes: 0,
          cardCount: 0,
          masteredCards: 0,
          noteCount: 0,
          lastStudied: null
        };
        
        existing.noteCount += 1;
        subjectMap.set(note.subject, existing);
      }
    });

    // Convert to subjects array
    const subjects: SubjectAnalytics[] = Array.from(subjectMap.entries()).map(([name, data]) => {
      const completionPercentage = data.cardCount > 0 ? Math.round((data.masteredCards / data.cardCount) * 100) : 0;
      const recentActivity = data.lastStudied ? 
        new Date(data.lastStudied) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : false;

      return {
        name,
        studyTimeMinutes: Math.round(data.studyTimeMinutes),
        completionPercentage,
        recentActivity,
        cardCount: data.cardCount,
        masteredCards: data.masteredCards,
        noteCount: data.noteCount,
        lastStudied: data.lastStudied
      };
    });

    return {
      totalSessions: sessions.length,
      totalStudyTime: totalHours,
      totalStudyTimeMinutes: Math.round(totalMinutes),
      todayStudyTime: todayHours,
      todayStudyTimeMinutes: Math.round(todayMinutes),
      weeklyStudyTimeMinutes: Math.round(weeklyMinutes),
      averageSessionTime: averageDuration,
      totalCardsReviewed,
      totalCardsCorrect,
      averageAccuracy,
      totalQuizzesTaken,
      streakDays,
      totalSets,
      totalCardsMastered: masteredCards,
      totalNotes: notes.length,
      subjects
    };
  }, [sessions, userSubjects, notes, flashcardData]);

  const isLoading = sessionsLoading || subjectsLoading || notesLoading || flashcardLoading;

  return {
    analytics,
    isLoading
  };
};

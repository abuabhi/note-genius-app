
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface EnhancedSubjectAnalytics {
  totalStudyTime: number;
  sessionsThisWeek: number;
  averageScore: number;
  longestStreak: number;
  last7Days: {
    studyTime: number;
    sessions: number;
    cardsReviewed: number;
  };
  last30Days: {
    studyTime: number;
    sessions: number;
    cardsReviewed: number;
  };
  weeklyAverage: number;
  monthlyAverage: number;
  dailyAverage: number;
  subjects: Array<{
    name: string;
    studyTime: number;
    sessions: number;
    progress: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  suggestedSubjects: string[];
}

export const useEnhancedSubjectAnalytics = () => {
  const { user } = useAuth();

  const { data: subjectAnalytics, isLoading } = useQuery({
    queryKey: ['enhanced-subject-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🔍 Fetching enhanced subject analytics for user:', user.id);

      // Calculate date ranges correctly
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      try {
        // Fetch study sessions
        console.log('📊 Fetching study sessions...');
        const { data: studySessions, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', thirtyDaysAgo.toISOString())
          .not('duration', 'is', null);

        if (sessionsError) {
          console.error('❌ Study sessions error:', sessionsError);
        } else {
          console.log('✅ Study sessions fetched:', studySessions?.length || 0);
        }

        // Fetch flashcard sets (using correct column name)
        console.log('🃏 Fetching flashcard sets...');
        const { data: flashcardSets, error: setsError } = await supabase
          .from('flashcard_sets')
          .select('id, title, created_at, user_id')
          .eq('user_id', user.id);

        if (setsError) {
          console.error('❌ Flashcard sets error:', setsError);
        } else {
          console.log('✅ Flashcard sets fetched:', flashcardSets?.length || 0);
        }

        // Fetch user subjects
        console.log('📚 Fetching user subjects...');
        const { data: userSubjects, error: subjectsError } = await supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id);

        if (subjectsError) {
          console.error('❌ User subjects error:', subjectsError);
        } else {
          console.log('✅ User subjects fetched:', userSubjects?.length || 0);
        }

        // Fetch flashcard progress
        console.log('📈 Fetching flashcard progress...');
        const { data: flashcardProgress, error: progressError } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .gte('last_reviewed_at', thirtyDaysAgo.toISOString());

        if (progressError) {
          console.error('❌ Flashcard progress error:', progressError);
        } else {
          console.log('✅ Flashcard progress fetched:', flashcardProgress?.length || 0);
        }

        // Safe data access with fallbacks
        const sessions = studySessions || [];
        const sets = flashcardSets || [];
        const subjects = userSubjects || [];
        const progress = flashcardProgress || [];

        // Calculate total study time (in hours)
        const totalStudyTime = Math.round(
          sessions.reduce((total, session) => total + (session.duration || 0), 0) / 3600
        );

        // Calculate sessions this week
        const sessionsThisWeek = sessions.filter(session => 
          new Date(session.start_time) >= startOfWeek
        ).length;

        // Calculate last 7 days metrics
        const last7DaysSessions = sessions.filter(session => 
          new Date(session.start_time) >= sevenDaysAgo
        );
        
        const last7Days = {
          studyTime: Math.round(
            last7DaysSessions.reduce((total, session) => total + (session.duration || 0), 0) / 3600
          ),
          sessions: last7DaysSessions.length,
          cardsReviewed: last7DaysSessions.reduce((total, session) => total + (session.cards_reviewed || 0), 0)
        };

        // Calculate last 30 days metrics
        const last30Days = {
          studyTime: totalStudyTime,
          sessions: sessions.length,
          cardsReviewed: sessions.reduce((total, session) => total + (session.cards_reviewed || 0), 0)
        };

        // Calculate averages
        const weeklyAverage = Math.round(totalStudyTime / 4.3); // 30 days / 7 days
        const monthlyAverage = totalStudyTime;
        const dailyAverage = Math.round(totalStudyTime / 30);

        // Calculate average score from quiz sessions
        const quizSessions = sessions.filter(session => 
          session.quiz_total_questions && session.quiz_total_questions > 0
        );
        
        const averageScore = quizSessions.length > 0 
          ? Math.round(
              quizSessions.reduce((total, session) => 
                total + ((session.quiz_score || 0) / (session.quiz_total_questions || 1)) * 100, 0
              ) / quizSessions.length
            )
          : 0;

        // Calculate longest streak (simplified)
        const uniqueStudyDates = [...new Set(
          sessions.map(session => new Date(session.start_time).toDateString())
        )].sort();
        
        let longestStreak = 0;
        let currentStreak = 0;
        let previousDate: Date | null = null;
        
        for (const dateStr of uniqueStudyDates) {
          const currentDate = new Date(dateStr);
          
          if (previousDate) {
            const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
              currentStreak++;
            } else {
              longestStreak = Math.max(longestStreak, currentStreak);
              currentStreak = 1;
            }
          } else {
            currentStreak = 1;
          }
          
          previousDate = currentDate;
        }
        longestStreak = Math.max(longestStreak, currentStreak);

        // Calculate subject-specific metrics
        const subjectMetrics = subjects.map(subject => {
          const subjectSessions = sessions.filter(session => 
            session.subject === subject.name
          );
          
          const studyTime = Math.round(
            subjectSessions.reduce((total, session) => total + (session.duration || 0), 0) / 3600
          );
          
          // Calculate progress based on recent activity
          const recentSessions = subjectSessions.filter(session => 
            new Date(session.start_time) >= sevenDaysAgo
          );
          
          const progress = Math.min(
            Math.round((recentSessions.length / Math.max(subjectSessions.length, 1)) * 100),
            100
          );
          
          // Simple trend calculation
          const veryRecentSessions = subjectSessions.filter(session => 
            new Date(session.start_time) >= new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          );
          
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (veryRecentSessions.length > recentSessions.length / 2) {
            trend = 'up';
          } else if (veryRecentSessions.length < recentSessions.length / 4) {
            trend = 'down';
          }

          return {
            name: subject.name,
            studyTime,
            sessions: subjectSessions.length,
            progress,
            trend
          };
        });

        // Generate suggested subjects based on activity patterns
        const allSubjectNames = ['Mathematics', 'Science', 'History', 'Literature', 'Physics', 'Chemistry', 'Biology'];
        const existingSubjects = subjects.map(s => s.name);
        const suggestedSubjects = allSubjectNames
          .filter(name => !existingSubjects.includes(name))
          .slice(0, 3);

        const result: EnhancedSubjectAnalytics = {
          totalStudyTime,
          sessionsThisWeek,
          averageScore,
          longestStreak,
          last7Days,
          last30Days,
          weeklyAverage,
          monthlyAverage,
          dailyAverage,
          subjects: subjectMetrics,
          suggestedSubjects
        };

        console.log('✅ Enhanced analytics calculated:', result);
        return result;

      } catch (error) {
        console.error('❌ Error in analytics calculation:', error);
        // Return default values on error
        return {
          totalStudyTime: 0,
          sessionsThisWeek: 0,
          averageScore: 0,
          longestStreak: 0,
          last7Days: { studyTime: 0, sessions: 0, cardsReviewed: 0 },
          last30Days: { studyTime: 0, sessions: 0, cardsReviewed: 0 },
          weeklyAverage: 0,
          monthlyAverage: 0,
          dailyAverage: 0,
          subjects: [],
          suggestedSubjects: []
        } as EnhancedSubjectAnalytics;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    subjectAnalytics: subjectAnalytics || {
      totalStudyTime: 0,
      sessionsThisWeek: 0,
      averageScore: 0,
      longestStreak: 0,
      last7Days: { studyTime: 0, sessions: 0, cardsReviewed: 0 },
      last30Days: { studyTime: 0, sessions: 0, cardsReviewed: 0 },
      weeklyAverage: 0,
      monthlyAverage: 0,
      dailyAverage: 0,
      subjects: [],
      suggestedSubjects: []
    },
    isLoading
  };
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { getFallbackSubjectAnalytics } from '@/utils/subjectAnalyticsUtils';

interface SubjectAnalytics {
  id: string;
  name: string;
  completionPercentage: number;
  totalStudyTimeMinutes: number;
  sessionCount: number;
}

interface AnalyticsResponse {
  subjects: SubjectAnalytics[];
  totalStudyTime: number;
  sessionsThisWeek: number;
  last7DaysFormatted: string | null;
  last30DaysFormatted: string | null;
}

export const useSaaSOptimizedSubjectAnalytics = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['subject-analytics', user?.id],
    queryFn: async (): Promise<AnalyticsResponse> => {
      if (!user?.id) {
        return {
          subjects: [],
          totalStudyTime: 0,
          sessionsThisWeek: 0,
          last7DaysFormatted: null,
          last30DaysFormatted: null,
        };
      }

      console.log('📊 Fetching subject analytics for user:', user.id);

      try {
        // Get flashcard sets with progress
        const { data: flashcardSets } = await supabase
          .from('flashcard_sets')
          .select(`
            *,
            flashcards!inner(
              id,
              user_flashcard_progress(mastery_level, grade)
            )
          `)
          .eq('user_id', user.id);

        // Get quizzes separately
        const { data: quizzes } = await supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', user.id);

        // Get quiz results for user's quizzes
        const { data: quizResults } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id);

        // Get study sessions
        const { data: studySessions } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

        // Get study plans
        const { data: studyPlans } = await supabase
          .from('study_plans')
          .select('*')
          .eq('user_id', user.id);

        // Get notes
        const { data: notes } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

        // Process the data to create unified analytics
        const subjectMap = new Map<string, SubjectAnalytics>();

        // Process flashcard sets
        flashcardSets?.forEach(set => {
          if (!set.subject) return;
          
          const subject = subjectMap.get(set.subject) || {
            id: set.subject,
            name: set.subject,
            completionPercentage: 0,
            totalStudyTimeMinutes: 0,
            sessionCount: 0,
          };

          const totalCards = set.flashcards?.length || 0;
          const masteredCards = set.flashcards?.filter(card => 
            card.user_flashcard_progress?.[0]?.mastery_level >= 4
          ).length || 0;

          if (totalCards > 0) {
            const flashcardProgress = Math.round((masteredCards / totalCards) * 100);
            subject.completionPercentage = Math.max(subject.completionPercentage, flashcardProgress);
          }
          
          subjectMap.set(set.subject, subject);
        });

        // Process quizzes and their results
        quizzes?.forEach(quiz => {
          if (!quiz.title) return;
          
          const subject = subjectMap.get(quiz.title) || {
            id: quiz.title,
            name: quiz.title,
            completionPercentage: 0,
            totalStudyTimeMinutes: 0,
            sessionCount: 0,
          };

          // Find results for this quiz
          const results = quizResults?.filter(result => result.quiz_id === quiz.id) || [];
          
          if (results.length > 0) {
            const avgScore = results.reduce((sum, result) => sum + (result.score / result.total_questions), 0) / results.length;
            const quizProgress = Math.round(avgScore * 100);
            subject.completionPercentage = Math.max(subject.completionPercentage, quizProgress);
          }
          
          subjectMap.set(quiz.title, subject);
        });

        // Process study sessions
        studySessions?.forEach(session => {
          if (!session.subject) return;
          
          const subject = subjectMap.get(session.subject) || {
            id: session.subject,
            name: session.subject,
            completionPercentage: 0,
            totalStudyTimeMinutes: 0,
            sessionCount: 0,
          };

          subject.sessionCount += 1;
          subject.totalStudyTimeMinutes += Math.floor((session.duration || 0) / 60);
          
          subjectMap.set(session.subject, subject);
        });

        // Process study plans
        studyPlans?.forEach(plan => {
          if (!plan.subject) return;
          
          const subject = subjectMap.get(plan.subject) || {
            id: plan.subject,
            name: plan.subject,
            completionPercentage: 0,
            totalStudyTimeMinutes: 0,
            sessionCount: 0,
          };

          if (plan.status === 'completed') {
            subject.completionPercentage = Math.max(subject.completionPercentage, 100);
          } else if (plan.status === 'active') {
            subject.completionPercentage = Math.max(subject.completionPercentage, 25);
          }
          
          subjectMap.set(plan.subject, subject);
        });

        // Calculate overall stats
        const subjects = Array.from(subjectMap.values());
        const totalStudyTime = studySessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
        const totalStudyTimeHours = totalStudyTime / (1000 * 60 * 60);

        // Calculate sessions this week
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const sessionsThisWeek = studySessions?.filter(session => 
          new Date(session.start_time) >= oneWeekAgo
        ).length || 0;

        // Calculate formatted time periods
        const last7DaysMinutes = studySessions?.filter(session => 
          new Date(session.start_time) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).reduce((sum, session) => sum + Math.floor((session.duration || 0) / 60), 0) || 0;

        const last30DaysMinutes = studySessions?.filter(session => 
          new Date(session.start_time) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).reduce((sum, session) => sum + Math.floor((session.duration || 0) / 60), 0) || 0;

        const formatTime = (minutes: number) => {
          if (minutes < 60) return `${minutes}m`;
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        };

        return {
          subjects,
          totalStudyTime: totalStudyTimeHours,
          sessionsThisWeek,
          last7DaysFormatted: last7DaysMinutes > 0 ? formatTime(last7DaysMinutes) : null,
          last30DaysFormatted: last30DaysMinutes > 0 ? formatTime(last30DaysMinutes) : null,
        };

      } catch (error) {
        console.error('❌ Database analytics failed, using fallback:', error);
        
        // Use fallback method
        const fallbackData = await getFallbackSubjectAnalytics(user.id);
        
        const subjects = fallbackData.map(subject => ({
          id: subject.subject_id || subject.subject_name,
          name: subject.subject_name,
          completionPercentage: subject.flashcard_accuracy || 0,
          totalStudyTimeMinutes: subject.total_study_minutes || 0,
          sessionCount: subject.study_sessions_count || 0,
        }));

        return {
          subjects,
          totalStudyTime: subjects.reduce((sum, s) => sum + s.totalStudyTimeMinutes, 0) / 60,
          sessionsThisWeek: 0,
          last7DaysFormatted: null,
          last30DaysFormatted: null,
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    subjectAnalytics: query.data || {
      subjects: [],
      totalStudyTime: 0,
      sessionsThisWeek: 0,
      last7DaysFormatted: null,
      last30DaysFormatted: null,
    },
    isLoading: query.isLoading,
  };
};


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface SubjectAnalytics {
  subjects: Array<{
    id: string;
    name: string;
    completionPercentage: number;
    totalStudyTimeMinutes: number;
    sessionCount: number;
  }>;
  totalStudyTime: number;
  sessionsThisWeek: number;
  last7DaysFormatted?: string;
  last30DaysFormatted?: string;
}

export const useSaaSOptimizedSubjectAnalytics = () => {
  const { user } = useAuth();

  const { data: subjectAnalytics, isLoading, error } = useQuery({
    queryKey: ['subject-analytics', user?.id],
    queryFn: async (): Promise<SubjectAnalytics> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 Fetching comprehensive subject analytics');
      console.log('🔍 Fetching analytics for user:', user.id);

      try {
        // Get flashcard sets with progress data
        const { data: flashcardSets, error: flashcardError } = await supabase
          .from('flashcard_sets')
          .select(`
            id,
            name,
            subject,
            card_count,
            created_at,
            user_flashcard_progress!inner(
              user_id,
              last_reviewed_at,
              repetition,
              ease_factor
            )
          `)
          .eq('user_id', user.id);

        if (flashcardError) {
          console.error('❌ Error fetching flashcard sets:', flashcardError);
        } else {
          console.log('📚 Found flashcard sets:', flashcardSets?.length || 0);
        }

        // Get study sessions
        const { data: studySessions, error: sessionError } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id);

        if (sessionError) {
          console.error('❌ Error fetching study sessions:', sessionError);
        } else {
          console.log('📖 Found study sessions:', studySessions?.length || 0);
        }

        // Get user subjects
        const { data: userSubjects, error: subjectsError } = await supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id);

        if (subjectsError) {
          console.error('❌ Error fetching user subjects:', subjectsError);
        } else {
          console.log('🎯 Found user subjects:', userSubjects?.length || 0);
        }

        // Get quiz results
        const { data: quizResults, error: quizError } = await supabase
          .from('quiz_results')
          .select(`
            id,
            score,
            total_questions,
            completed_at,
            quizzes!inner(
              id,
              title,
              subject_id,
              academic_subjects(name)
            )
          `)
          .eq('user_id', user.id);

        if (quizError) {
          console.error('❌ Error fetching quiz results:', quizError);
        } else {
          console.log('🧠 Found quiz results:', quizResults?.length || 0);
        }

        // Get study plans
        const { data: studyPlans, error: plansError } = await supabase
          .from('study_plans')
          .select('*')
          .eq('user_id', user.id);

        if (plansError) {
          console.error('❌ Error fetching study plans:', plansError);
        } else {
          console.log('📋 Found study plans:', studyPlans?.length || 0);
        }

        // Create subject map from all data sources
        const subjectMap = new Map<string, {
          id: string;
          name: string;
          studyTimeMinutes: number;
          sessionCount: number;
          totalItems: number;
          completedItems: number;
        }>();

        // Process user subjects first
        if (userSubjects) {
          userSubjects.forEach(subject => {
            subjectMap.set(subject.name, {
              id: subject.id,
              name: subject.name,
              studyTimeMinutes: 0,
              sessionCount: 0,
              totalItems: 0,
              completedItems: 0
            });
          });
        }

        // Process flashcard sets
        if (flashcardSets) {
          flashcardSets.forEach(set => {
            const subjectName = set.subject || 'General';
            if (!subjectMap.has(subjectName)) {
              subjectMap.set(subjectName, {
                id: set.id,
                name: subjectName,
                studyTimeMinutes: 0,
                sessionCount: 0,
                totalItems: 0,
                completedItems: 0
              });
            }
            
            const subject = subjectMap.get(subjectName)!;
            subject.totalItems += set.card_count || 0;
            
            // Count completed items based on progress
            if (set.user_flashcard_progress) {
              const progressCount = Array.isArray(set.user_flashcard_progress) 
                ? set.user_flashcard_progress.length 
                : 1;
              subject.completedItems += progressCount;
            }
          });
        }

        // Process quiz results
        if (quizResults) {
          quizResults.forEach(result => {
            const subjectName = result.quizzes?.academic_subjects?.name || 
                             result.quizzes?.title || 'General';
            
            if (!subjectMap.has(subjectName)) {
              subjectMap.set(subjectName, {
                id: result.id,
                name: subjectName,
                studyTimeMinutes: 0,
                sessionCount: 0,
                totalItems: 0,
                completedItems: 0
              });
            }
            
            const subject = subjectMap.get(subjectName)!;
            subject.totalItems += result.total_questions;
            subject.completedItems += result.score;
            subject.sessionCount += 1;
          });
        }

        // Process study sessions
        if (studySessions) {
          studySessions.forEach(session => {
            const subjectName = session.subject || 'General';
            
            if (!subjectMap.has(subjectName)) {
              subjectMap.set(subjectName, {
                id: session.id,
                name: subjectName,
                studyTimeMinutes: 0,
                sessionCount: 0,
                totalItems: 0,
                completedItems: 0
              });
            }
            
            const subject = subjectMap.get(subjectName)!;
            subject.studyTimeMinutes += session.duration ? Math.floor(session.duration / 60) : 0;
            subject.sessionCount += 1;
          });
        }

        // Convert map to array with completion percentages
        const subjects = Array.from(subjectMap.values()).map(subject => ({
          id: subject.id,
          name: subject.name,
          completionPercentage: subject.totalItems > 0 
            ? Math.round((subject.completedItems / subject.totalItems) * 100)
            : 0,
          totalStudyTimeMinutes: subject.studyTimeMinutes,
          sessionCount: subject.sessionCount
        }));

        // Calculate totals
        const totalStudyTime = studySessions?.reduce((acc, session) => {
          return acc + (session.duration || 0);
        }, 0) || 0;

        const sessionsThisWeek = studySessions?.filter(session => {
          const sessionDate = new Date(session.start_time);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return sessionDate >= weekAgo;
        }).length || 0;

        console.log('✅ Processed subjects:', subjects.length);
        console.log('🎉 Analytics result:', {
          subjectsCount: subjects.length,
          totalStudyTime: totalStudyTime / 3600, // Convert to hours
          sessionsThisWeek
        });

        return {
          subjects,
          totalStudyTime: totalStudyTime / 3600, // Convert to hours
          sessionsThisWeek,
          last7DaysFormatted: `${Math.floor(totalStudyTime / 3600)}h`,
          last30DaysFormatted: `${Math.floor(totalStudyTime / 3600)}h`
        };

      } catch (error) {
        console.error('❌ Error in analytics query:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    subjectAnalytics: subjectAnalytics || {
      subjects: [],
      totalStudyTime: 0,
      sessionsThisWeek: 0
    },
    isLoading,
    error
  };
};

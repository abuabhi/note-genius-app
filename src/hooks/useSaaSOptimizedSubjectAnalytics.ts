
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface SubjectAnalytics {
  id: string;
  name: string;
  completionPercentage: number;
  totalStudyTimeMinutes: number;
  sessionCount: number;
  flashcardCount: number;
  quizCount: number;
  averageQuizScore: number;
}

interface AnalyticsResponse {
  subjects: SubjectAnalytics[];
  totalStudyTime: number;
  sessionsThisWeek: number;
  last7DaysFormatted: string;
  last30DaysFormatted: string;
  timezone: string;
  todayString: string;
}

export const useSaaSOptimizedSubjectAnalytics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saas-optimized-subject-analytics', user?.id],
    queryFn: async (): Promise<AnalyticsResponse> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      const today = now.toLocaleDateString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch flashcard sets with progress
      const { data: flashcardSets, error: flashcardError } = await supabase
        .from('flashcard_sets')
        .select(`
          id,
          name,
          subject,
          card_count
        `)
        .eq('user_id', user.id);

      if (flashcardError) throw flashcardError;

      // Fetch flashcard progress
      const { data: flashcardProgress, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('flashcard_id, mastery_level, last_reviewed_at')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Fetch quizzes
      const { data: quizzes, error: quizError } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          academic_subjects!inner(name)
        `)
        .eq('user_id', user.id);

      if (quizError) throw quizError;

      // Fetch quiz results
      const { data: quizResults, error: quizResultsError } = await supabase
        .from('quiz_results')
        .select('quiz_id, score, total_questions, completed_at')
        .eq('user_id', user.id);

      if (quizResultsError) throw quizResultsError;

      // Fetch study sessions
      const { data: studySessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('subject, duration, start_time')
        .eq('user_id', user.id)
        .not('duration', 'is', null);

      if (sessionsError) throw sessionsError;

      // Fetch study plans
      const { data: studyPlans, error: plansError } = await supabase
        .from('study_plans')
        .select('subject, status, created_at')
        .eq('user_id', user.id);

      if (plansError) throw plansError;

      // Process data to create subject analytics
      const subjectMap = new Map<string, {
        flashcardCount: number;
        flashcardProgress: number;
        quizCount: number;
        averageQuizScore: number;
        totalStudyTime: number;
        sessionCount: number;
        hasActivity: boolean;
      }>();

      // Process flashcard sets
      flashcardSets?.forEach(set => {
        if (!set.subject) return;
        
        const subject = subjectMap.get(set.subject) || {
          flashcardCount: 0,
          flashcardProgress: 0,
          quizCount: 0,
          averageQuizScore: 0,
          totalStudyTime: 0,
          sessionCount: 0,
          hasActivity: false
        };

        subject.flashcardCount += set.card_count || 0;
        subject.hasActivity = true;
        subjectMap.set(set.subject, subject);
      });

      // Process flashcard progress
      flashcardProgress?.forEach(progress => {
        // Find which subject this flashcard belongs to
        // Note: This is a simplified approach - in practice you'd need to join through flashcards table
        if (progress.mastery_level && progress.mastery_level > 1) {
          // Assume we can get subject from flashcard sets above
          // This is a placeholder - you'd need proper joining logic
        }
      });

      // Process quizzes
      quizzes?.forEach(quiz => {
        const subjectName = quiz.academic_subjects?.name;
        if (!subjectName) return;

        const subject = subjectMap.get(subjectName) || {
          flashcardCount: 0,
          flashcardProgress: 0,
          quizCount: 0,
          averageQuizScore: 0,
          totalStudyTime: 0,
          sessionCount: 0,
          hasActivity: false
        };

        subject.quizCount += 1;
        subject.hasActivity = true;
        subjectMap.set(subjectName, subject);
      });

      // Process quiz results
      const quizSubjectScores = new Map<string, number[]>();
      quizResults?.forEach(result => {
        // Find the quiz to get its subject
        const quiz = quizzes?.find(q => q.id === result.quiz_id);
        const subjectName = quiz?.academic_subjects?.name;
        if (!subjectName) return;

        const scores = quizSubjectScores.get(subjectName) || [];
        const scorePercentage = result.total_questions > 0 ? (result.score / result.total_questions) * 100 : 0;
        scores.push(scorePercentage);
        quizSubjectScores.set(subjectName, scores);
      });

      // Calculate average quiz scores
      quizSubjectScores.forEach((scores, subjectName) => {
        const subject = subjectMap.get(subjectName);
        if (subject) {
          subject.averageQuizScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        }
      });

      // Process study sessions
      studySessions?.forEach(session => {
        if (!session.subject) return;

        const subject = subjectMap.get(session.subject) || {
          flashcardCount: 0,
          flashcardProgress: 0,
          quizCount: 0,
          averageQuizScore: 0,
          totalStudyTime: 0,
          sessionCount: 0,
          hasActivity: false
        };

        subject.totalStudyTime += session.duration || 0;
        subject.sessionCount += 1;
        subject.hasActivity = true;
        subjectMap.set(session.subject, subject);
      });

      // Process study plans
      studyPlans?.forEach(plan => {
        if (!plan.subject) return;

        const subject = subjectMap.get(plan.subject) || {
          flashcardCount: 0,
          flashcardProgress: 0,
          quizCount: 0,
          averageQuizScore: 0,
          totalStudyTime: 0,
          sessionCount: 0,
          hasActivity: false
        };

        subject.hasActivity = true;
        subjectMap.set(plan.subject, subject);
      });

      // Convert to subject analytics array (only subjects with activity)
      const subjects: SubjectAnalytics[] = Array.from(subjectMap.entries())
        .filter(([_, data]) => data.hasActivity)
        .map(([name, data]) => {
          // Calculate completion percentage based on available data
          let completionPercentage = 0;
          let factorsCount = 0;

          // Factor in quiz performance
          if (data.quizCount > 0 && data.averageQuizScore > 0) {
            completionPercentage += data.averageQuizScore;
            factorsCount += 1;
          }

          // Factor in flashcard progress (simplified)
          if (data.flashcardCount > 0) {
            const flashcardCompletion = Math.min(data.flashcardProgress * 20, 100); // Rough estimate
            completionPercentage += flashcardCompletion;
            factorsCount += 1;
          }

          // Factor in study time (sessions indicate engagement)
          if (data.sessionCount > 0) {
            const sessionCompletion = Math.min(data.sessionCount * 10, 100); // Rough estimate
            completionPercentage += sessionCompletion;
            factorsCount += 1;
          }

          // Average the factors or default to 50% if we have activity but no clear metrics
          if (factorsCount > 0) {
            completionPercentage = Math.round(completionPercentage / factorsCount);
          } else {
            completionPercentage = 50; // Default for subjects with activity but unclear progress
          }

          return {
            id: name,
            name,
            completionPercentage: Math.min(completionPercentage, 100),
            totalStudyTimeMinutes: data.totalStudyTime,
            sessionCount: data.sessionCount,
            flashcardCount: data.flashcardCount,
            quizCount: data.quizCount,
            averageQuizScore: Math.round(data.averageQuizScore)
          };
        })
        .sort((a, b) => b.completionPercentage - a.completionPercentage);

      // Calculate total metrics
      const totalStudyTime = studySessions?.reduce((total, session) => total + (session.duration || 0), 0) || 0;
      const totalStudyTimeHours = totalStudyTime / 60;

      const sessionsThisWeek = studySessions?.filter(session => 
        new Date(session.start_time) >= weekAgo
      ).length || 0;

      const last7DaysTime = studySessions?.filter(session => 
        new Date(session.start_time) >= weekAgo
      ).reduce((total, session) => total + (session.duration || 0), 0) || 0;

      const last30DaysTime = studySessions?.filter(session => 
        new Date(session.start_time) >= monthAgo
      ).reduce((total, session) => total + (session.duration || 0), 0) || 0;

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
        last7DaysFormatted: formatTime(last7DaysTime),
        last30DaysFormatted: formatTime(last30DaysTime),
        timezone,
        todayString: today
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

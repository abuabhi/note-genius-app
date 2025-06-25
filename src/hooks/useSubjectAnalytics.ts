
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTimezoneAwareAnalytics } from './useTimezoneAwareAnalytics';

export interface SubjectProgress {
  id: string;
  name: string;
  totalStudyTimeMinutes: number;
  completionPercentage: number;
  flashcardMastery: number;
  quizPerformance: number;
  studyConsistency: number;
  sessionCount: number;
  averageScore: number;
  color: 'green' | 'yellow' | 'red';
}

export interface SubjectAnalytics {
  subjects: SubjectProgress[];
  totalStudyTime: number;
  sessionsThisWeek: number;
  averageScore: number;
  longestStreak: number;
}

export const useSubjectAnalytics = () => {
  const { user } = useAuth();
  const { analytics } = useTimezoneAwareAnalytics();

  const { data: subjectAnalytics, isLoading } = useQuery({
    queryKey: ['subject-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get user's subjects
      const { data: userSubjects, error: subjectsError } = await supabase
        .from('user_subjects')
        .select('*')
        .eq('user_id', user.id);

      if (subjectsError) throw subjectsError;

      // Get flashcard sets with progress
      const { data: flashcardSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select(`
          *,
          flashcards!inner(
            id,
            user_flashcard_progress(mastery_level, grade)
          )
        `)
        .eq('user_id', user.id);

      if (setsError) throw setsError;

      // Get quiz results with quiz subject info
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select(`
          *,
          quizzes!inner(
            subject_id,
            academic_subjects(name)
          )
        `)
        .eq('user_id', user.id);

      if (quizError) throw quizError;

      // Get study sessions
      const { data: studySessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .not('duration', 'is', null);

      if (sessionsError) throw sessionsError;

      // Calculate progress for each subject
      const subjectProgressMap = new Map<string, SubjectProgress>();
      
      // Initialize subjects
      userSubjects?.forEach(subject => {
        subjectProgressMap.set(subject.name, {
          id: subject.id,
          name: subject.name,
          totalStudyTimeMinutes: 0,
          completionPercentage: 0,
          flashcardMastery: 0,
          quizPerformance: 0,
          studyConsistency: 0,
          sessionCount: 0,
          averageScore: 0,
          color: 'red'
        });
      });

      // Calculate study time from sessions
      studySessions?.forEach(session => {
        if (session.subject && subjectProgressMap.has(session.subject)) {
          const subject = subjectProgressMap.get(session.subject)!;
          subject.totalStudyTimeMinutes += session.duration || 0;
          subject.sessionCount += 1;
        }
      });

      // Calculate flashcard mastery
      flashcardSets?.forEach(set => {
        if (set.subject && subjectProgressMap.has(set.subject)) {
          const subject = subjectProgressMap.get(set.subject)!;
          const flashcards = set.flashcards || [];
          
          if (flashcards.length > 0) {
            const masteredCards = flashcards.filter(card => 
              card.user_flashcard_progress?.[0]?.mastery_level >= 4
            ).length;
            subject.flashcardMastery = (masteredCards / flashcards.length) * 100;
          }
        }
      });

      // Calculate quiz performance
      const quizBySubject = new Map<string, number[]>();
      quizResults?.forEach(result => {
        const subjectName = result.quizzes?.academic_subjects?.name;
        if (subjectName) {
          if (!quizBySubject.has(subjectName)) {
            quizBySubject.set(subjectName, []);
          }
          const score = (result.score / result.total_questions) * 100;
          quizBySubject.get(subjectName)!.push(score);
        }
      });

      quizBySubject.forEach((scores, subjectName) => {
        if (subjectProgressMap.has(subjectName)) {
          const subject = subjectProgressMap.get(subjectName)!;
          subject.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          subject.quizPerformance = subject.averageScore;
        }
      });

      // Calculate study consistency (sessions per week over last 4 weeks)
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      
      const recentSessions = studySessions?.filter(s => 
        new Date(s.start_time) >= fourWeeksAgo
      ) || [];

      const sessionsBySubject = new Map<string, number>();
      recentSessions.forEach(session => {
        if (session.subject && subjectProgressMap.has(session.subject)) {
          sessionsBySubject.set(
            session.subject, 
            (sessionsBySubject.get(session.subject) || 0) + 1
          );
        }
      });

      sessionsBySubject.forEach((count, subjectName) => {
        if (subjectProgressMap.has(subjectName)) {
          const subject = subjectProgressMap.get(subjectName)!;
          subject.studyConsistency = Math.min((count / 4) * 25, 100); // 4 sessions per week = 100%
        }
      });

      // Calculate final completion percentage and color
      Array.from(subjectProgressMap.values()).forEach(subject => {
        const flashcardWeight = 0.4;
        const quizWeight = 0.4;
        const consistencyWeight = 0.2;
        
        subject.completionPercentage = Math.round(
          (subject.flashcardMastery * flashcardWeight) +
          (subject.quizPerformance * quizWeight) +
          (subject.studyConsistency * consistencyWeight)
        );

        // Assign color based on completion
        if (subject.completionPercentage >= 85) {
          subject.color = 'green';
        } else if (subject.completionPercentage >= 60) {
          subject.color = 'yellow';
        } else {
          subject.color = 'red';
        }
      });

      const subjects = Array.from(subjectProgressMap.values())
        .sort((a, b) => b.completionPercentage - a.completionPercentage);

      return {
        subjects,
        totalStudyTime: analytics.totalStudyTime,
        sessionsThisWeek: analytics.weeklySessions,
        averageScore: subjects.reduce((acc, s) => acc + s.averageScore, 0) / Math.max(subjects.length, 1),
        longestStreak: analytics.streakDays
      } as SubjectAnalytics;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    subjectAnalytics: subjectAnalytics || {
      subjects: [],
      totalStudyTime: 0,
      sessionsThisWeek: 0,
      averageScore: 0,
      longestStreak: 0
    },
    isLoading
  };
};

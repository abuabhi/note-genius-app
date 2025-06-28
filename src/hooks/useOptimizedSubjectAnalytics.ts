
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useStableStats } from './useStableStats';
import { useMemo } from 'react';

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

export interface OptimizedSubjectAnalytics {
  subjects: SubjectProgress[];
  totalStudyTime: number;
  sessionsThisWeek: number;
  averageScore: number;
  longestStreak: number;
}

export const useOptimizedSubjectAnalytics = () => {
  const { user } = useAuth();
  const { stats } = useStableStats();

  const { data: subjectAnalytics, isLoading } = useQuery({
    queryKey: ['optimized-subject-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🔍 Fetching optimized subject analytics');

      // Parallel queries for better performance
      const [userSubjects, flashcardSets, quizResults, studySessions] = await Promise.all([
        supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id),
        
        supabase
          .from('flashcard_sets')
          .select(`
            *,
            flashcards!inner(
              id,
              user_flashcard_progress(mastery_level, grade)
            )
          `)
          .eq('user_id', user.id),
        
        supabase
          .from('quiz_results')
          .select(`
            *,
            quizzes!inner(
              subject_id,
              academic_subjects(name)
            )
          `)
          .eq('user_id', user.id)
          .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()), // Last 30 days only
        
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days only
      ]);

      if (userSubjects.error) throw userSubjects.error;
      if (flashcardSets.error) throw flashcardSets.error;
      if (quizResults.error) throw quizResults.error;
      if (studySessions.error) throw studySessions.error;

      // Initialize subjects with optimized processing
      const subjectProgressMap = new Map<string, SubjectProgress>();
      
      userSubjects.data?.forEach(subject => {
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

      // Process study sessions efficiently
      studySessions.data?.forEach(session => {
        if (session.subject && subjectProgressMap.has(session.subject)) {
          const subject = subjectProgressMap.get(session.subject)!;
          subject.totalStudyTimeMinutes += Math.floor((session.duration || 0) / 60);
          subject.sessionCount += 1;
        }
      });

      // Process flashcard mastery
      flashcardSets.data?.forEach(set => {
        if (set.subject && subjectProgressMap.has(set.subject)) {
          const subject = subjectProgressMap.get(set.subject)!;
          const flashcards = set.flashcards || [];
          
          if (flashcards.length > 0) {
            const masteredCards = flashcards.filter(card => 
              card.user_flashcard_progress?.[0]?.mastery_level >= 4
            ).length;
            subject.flashcardMastery = Math.round((masteredCards / flashcards.length) * 100);
          }
        }
      });

      // Process quiz performance with optimized calculations
      const quizBySubject = new Map<string, number[]>();
      quizResults.data?.forEach(result => {
        const subjectName = result.quizzes?.academic_subjects?.name;
        if (subjectName) {
          if (!quizBySubject.has(subjectName)) {
            quizBySubject.set(subjectName, []);
          }
          const score = Math.round((result.score / result.total_questions) * 100);
          quizBySubject.get(subjectName)!.push(score);
        }
      });

      quizBySubject.forEach((scores, subjectName) => {
        if (subjectProgressMap.has(subjectName)) {
          const subject = subjectProgressMap.get(subjectName)!;
          subject.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          subject.quizPerformance = subject.averageScore;
        }
      });

      // Calculate study consistency (optimized)
      const sessionsBySubject = new Map<string, number>();
      studySessions.data?.forEach(session => {
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
          subject.studyConsistency = Math.min(Math.round((count / 4) * 25), 100);
        }
      });

      // Calculate final completion percentage and assign colors
      const subjects = Array.from(subjectProgressMap.values()).map(subject => {
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

        return subject;
      }).sort((a, b) => b.completionPercentage - a.completionPercentage);

      console.log('✅ Optimized subject analytics calculated');

      return {
        subjects,
        totalStudyTime: stats.studyTimeHours,
        sessionsThisWeek: stats.weeklySessions,
        averageScore: subjects.reduce((acc, s) => acc + s.averageScore, 0) / Math.max(subjects.length, 1),
        longestStreak: stats.streakDays
      } as OptimizedSubjectAnalytics;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for SaaS performance
    gcTime: 10 * 60 * 1000, // 10 minutes memory retention
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

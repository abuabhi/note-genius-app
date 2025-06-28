
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
  lastStudyDate?: string;
  weeklyStudyTime: number;
  monthlyStudyTime: number;
}

export interface StudyTimeInsights {
  dailyAverage: number;
  weeklyAverage: number;
  monthlyAverage: number;
  last7Days: number;
  last30Days: number;
  thisWeek: number;
  thisMonth: number;
}

export interface EnhancedSubjectAnalytics {
  subjects: SubjectProgress[];
  totalStudyTime: number;
  sessionsThisWeek: number;
  averageScore: number;
  longestStreak: number;
  studyTimeInsights: StudyTimeInsights;
  subjectSuggestions: string[];
  hasSubjects: boolean;
}

export const useEnhancedSubjectAnalytics = () => {
  const { user } = useAuth();
  const { stats } = useStableStats();

  const { data: subjectAnalytics, isLoading } = useQuery({
    queryKey: ['enhanced-subject-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🔍 Fetching enhanced subject analytics');

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
          .gte('completed_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()),
        
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .gte('start_time', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      if (userSubjects.error) throw userSubjects.error;
      if (flashcardSets.error) throw flashcardSets.error;
      if (quizResults.error) throw quizResults.error;
      if (studySessions.error) throw studySessions.error;

      // Calculate time periods
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Initialize subjects with enhanced data
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
          color: 'red',
          weeklyStudyTime: 0,
          monthlyStudyTime: 0
        });
      });

      // Process study sessions with time period calculations
      studySessions.data?.forEach(session => {
        const sessionDate = new Date(session.start_time);
        const sessionMinutes = Math.floor((session.duration || 0) / 60);
        
        if (session.subject && subjectProgressMap.has(session.subject)) {
          const subject = subjectProgressMap.get(session.subject)!;
          subject.totalStudyTimeMinutes += sessionMinutes;
          subject.sessionCount += 1;
          
          if (sessionDate >= last7Days) {
            subject.weeklyStudyTime += sessionMinutes;
          }
          if (sessionDate >= last30Days) {
            subject.monthlyStudyTime += sessionMinutes;
          }
          
          const sessionDateString = sessionDate.toISOString().split('T')[0];
          if (!subject.lastStudyDate || sessionDateString > subject.lastStudyDate) {
            subject.lastStudyDate = sessionDateString;
          }
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

      // Process quiz performance
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

      // Calculate study consistency
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

        if (subject.completionPercentage >= 85) {
          subject.color = 'green';
        } else if (subject.completionPercentage >= 60) {
          subject.color = 'yellow';
        } else {
          subject.color = 'red';
        }

        return subject;
      }).sort((a, b) => b.completionPercentage - a.completionPercentage);

      // Calculate study time insights
      const totalSessionsLast7Days = studySessions.data?.filter(s => 
        new Date(s.start_time) >= last7Days
      ).reduce((acc, s) => acc + Math.floor((s.duration || 0) / 60), 0) || 0;

      const totalSessionsLast30Days = studySessions.data?.filter(s => 
        new Date(s.start_time) >= last30Days
      ).reduce((acc, s) => acc + Math.floor((s.duration || 0) / 60), 0) || 0;

      const totalSessionsThisWeek = studySessions.data?.filter(s => 
        new Date(s.start_time) >= startOfWeek
      ).reduce((acc, s) => acc + Math.floor((s.duration || 0) / 60), 0) || 0;

      const totalSessionsThisMonth = studySessions.data?.filter(s => 
        new Date(s.start_time) >= startOfMonth
      ).reduce((acc, s) => acc + Math.floor((s.duration || 0) / 60), 0) || 0;

      const studyTimeInsights: StudyTimeInsights = {
        dailyAverage: Math.round(totalSessionsLast30Days / 30),
        weeklyAverage: Math.round(totalSessionsLast30Days / 4.3),
        monthlyAverage: totalSessionsLast30Days,
        last7Days: totalSessionsLast7Days,
        last30Days: totalSessionsLast30Days,
        thisWeek: totalSessionsThisWeek,
        thisMonth: totalSessionsThisMonth
      };

      // Subject suggestions for new users
      const subjectSuggestions = [
        'Mathematics', 'Science', 'History', 'Literature', 'Physics',
        'Chemistry', 'Biology', 'Computer Science', 'Psychology', 'Philosophy'
      ];

      console.log('✅ Enhanced subject analytics calculated');

      return {
        subjects,
        totalStudyTime: stats.studyTimeHours,
        sessionsThisWeek: stats.weeklySessions,
        averageScore: subjects.reduce((acc, s) => acc + s.averageScore, 0) / Math.max(subjects.length, 1),
        longestStreak: stats.streakDays,
        studyTimeInsights,
        subjectSuggestions,
        hasSubjects: subjects.length > 0
      } as EnhancedSubjectAnalytics;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    subjectAnalytics: subjectAnalytics || {
      subjects: [],
      totalStudyTime: 0,
      sessionsThisWeek: 0,
      averageScore: 0,
      longestStreak: 0,
      studyTimeInsights: {
        dailyAverage: 0,
        weeklyAverage: 0,
        monthlyAverage: 0,
        last7Days: 0,
        last30Days: 0,
        thisWeek: 0,
        thisMonth: 0
      },
      subjectSuggestions: [],
      hasSubjects: false
    },
    isLoading
  };
};

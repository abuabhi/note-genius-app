
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface EnhancedSubjectProgress {
  id: string;
  name: string;
  totalStudyTimeMinutes: number;
  last7DaysTime: number;
  last7DaysSessions: number;
  last30DaysTime: number;
  last30DaysSessions: number;
  completionPercentage: number;
  flashcardMastery: number;
  quizPerformance: number;
  studyConsistency: number;
  sessionCount: number;
  averageScore: number;
  color: 'green' | 'yellow' | 'red';
  hasFlashcards: boolean;
  hasQuizzes: boolean;
  hasNotes: boolean;
  hasStudyPlans: boolean;
}

export interface SaaSOptimizedSubjectAnalytics {
  subjects: EnhancedSubjectProgress[];
  totalStudyTime: number;
  sessionsThisWeek: number;
  averageScore: number;
  longestStreak: number;
  last7DaysFormatted: string;
  last30DaysFormatted: string;
}

// Helper function to format time and sessions
const formatTimeAndSessions = (minutes: number, sessions: number): string => {
  if (minutes === 0 && sessions === 0) return '0m in 0 sessions';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  let timeStr = '';
  if (hours > 0) {
    timeStr = remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else {
    timeStr = `${remainingMinutes}m`;
  }
  
  return `${timeStr} in ${sessions} session${sessions !== 1 ? 's' : ''}`;
};

export const useSaaSOptimizedSubjectAnalytics = () => {
  const { user } = useAuth();

  const { data: subjectAnalytics, isLoading } = useQuery({
    queryKey: ['saas-optimized-subject-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🔍 Fetching comprehensive subject analytics');

      // Calculate date ranges
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch all data sources in parallel for performance
      const [
        userSubjects,
        flashcardSets,
        notes,
        studyPlans,
        quizResults,
        studySessions,
        recentSessions7Days,
        recentSessions30Days
      ] = await Promise.all([
        // User subjects as base
        supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id),
        
        // Flashcard sets with progress
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
        
        // Notes by subject
        supabase
          .from('notes')
          .select(`
            *,
            user_subjects!inner(name)
          `)
          .eq('user_id', user.id),
        
        // Study plans (all status)
        supabase
          .from('study_plans')
          .select('*')
          .eq('user_id', user.id),
        
        // Quiz results with subject info
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
          .gte('completed_at', thirtyDaysAgo.toISOString()),
        
        // All study sessions
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .gte('start_time', thirtyDaysAgo.toISOString()),
        
        // Recent sessions for 7 days
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .gte('start_time', sevenDaysAgo.toISOString()),
        
        // Recent sessions for 30 days
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .gte('start_time', thirtyDaysAgo.toISOString())
      ]);

      if (userSubjects.error) throw userSubjects.error;
      if (flashcardSets.error) throw flashcardSets.error;
      if (notes.error) throw notes.error;
      if (studyPlans.error) throw studyPlans.error;
      if (quizResults.error) throw quizResults.error;
      if (studySessions.error) throw studySessions.error;

      // Collect all unique subjects from all sources
      const allSubjects = new Set<string>();
      
      // Add subjects from user_subjects
      userSubjects.data?.forEach(subject => allSubjects.add(subject.name));
      
      // Add subjects from flashcard sets
      flashcardSets.data?.forEach(set => {
        if (set.subject) allSubjects.add(set.subject);
      });
      
      // Add subjects from notes
      notes.data?.forEach(note => {
        if (note.user_subjects?.name) allSubjects.add(note.user_subjects.name);
      });
      
      // Add subjects from study plans
      studyPlans.data?.forEach(plan => {
        if (plan.subject) allSubjects.add(plan.subject);
      });
      
      // Add subjects from quiz results
      quizResults.data?.forEach(result => {
        const subjectName = result.quizzes?.academic_subjects?.name;
        if (subjectName) allSubjects.add(subjectName);
      });
      
      // Add subjects from study sessions
      studySessions.data?.forEach(session => {
        if (session.subject) allSubjects.add(session.subject);
      });

      // Initialize subject progress map
      const subjectProgressMap = new Map<string, EnhancedSubjectProgress>();
      
      Array.from(allSubjects).forEach(subjectName => {
        subjectProgressMap.set(subjectName, {
          id: subjectName.toLowerCase().replace(/\s+/g, '-'),
          name: subjectName,
          totalStudyTimeMinutes: 0,
          last7DaysTime: 0,
          last7DaysSessions: 0,
          last30DaysTime: 0,
          last30DaysSessions: 0,
          completionPercentage: 0,
          flashcardMastery: 0,
          quizPerformance: 0,
          studyConsistency: 0,
          sessionCount: 0,
          averageScore: 0,
          color: 'red',
          hasFlashcards: false,
          hasQuizzes: false,
          hasNotes: false,
          hasStudyPlans: false
        });
      });

      // Process flashcard data
      flashcardSets.data?.forEach(set => {
        if (!set.subject) return;
        const subject = subjectProgressMap.get(set.subject);
        if (!subject) return;
        
        subject.hasFlashcards = true;
        const flashcards = set.flashcards || [];
        
        if (flashcards.length > 0) {
          const masteredCards = flashcards.filter(card => 
            card.user_flashcard_progress?.[0]?.mastery_level >= 4
          ).length;
          subject.flashcardMastery = Math.round((masteredCards / flashcards.length) * 100);
        }
      });

      // Process notes data
      notes.data?.forEach(note => {
        const subjectName = note.user_subjects?.name;
        if (!subjectName) return;
        const subject = subjectProgressMap.get(subjectName);
        if (subject) {
          subject.hasNotes = true;
        }
      });

      // Process study plans data
      studyPlans.data?.forEach(plan => {
        if (!plan.subject) return;
        const subject = subjectProgressMap.get(plan.subject);
        if (subject) {
          subject.hasStudyPlans = true;
        }
      });

      // Process quiz performance
      const quizBySubject = new Map<string, number[]>();
      quizResults.data?.forEach(result => {
        const subjectName = result.quizzes?.academic_subjects?.name;
        if (!subjectName) return;
        
        const subject = subjectProgressMap.get(subjectName);
        if (subject) {
          subject.hasQuizzes = true;
        }
        
        if (!quizBySubject.has(subjectName)) {
          quizBySubject.set(subjectName, []);
        }
        const score = Math.round((result.score / result.total_questions) * 100);
        quizBySubject.get(subjectName)!.push(score);
      });

      quizBySubject.forEach((scores, subjectName) => {
        const subject = subjectProgressMap.get(subjectName);
        if (subject) {
          subject.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          subject.quizPerformance = subject.averageScore;
        }
      });

      // Process study sessions data
      studySessions.data?.forEach(session => {
        if (!session.subject) return;
        const subject = subjectProgressMap.get(session.subject);
        if (!subject) return;
        
        const durationMinutes = Math.floor((session.duration || 0) / 60);
        subject.totalStudyTimeMinutes += durationMinutes;
        subject.sessionCount += 1;
      });

      // Process recent sessions for time periods
      recentSessions7Days.data?.forEach(session => {
        if (!session.subject) return;
        const subject = subjectProgressMap.get(session.subject);
        if (!subject) return;
        
        const durationMinutes = Math.floor((session.duration || 0) / 60);
        subject.last7DaysTime += durationMinutes;
        subject.last7DaysSessions += 1;
      });

      recentSessions30Days.data?.forEach(session => {
        if (!session.subject) return;
        const subject = subjectProgressMap.get(session.subject);
        if (!subject) return;
        
        const durationMinutes = Math.floor((session.duration || 0) / 60);
        subject.last30DaysTime += durationMinutes;
        subject.last30DaysSessions += 1;
      });

      // Calculate study consistency and final completion percentage
      subjectProgressMap.forEach((subject, subjectName) => {
        // Study consistency based on recent activity
        const recentSessions = subject.last30DaysSessions;
        subject.studyConsistency = Math.min(Math.round((recentSessions / 4) * 25), 100);
        
        // Calculate weighted completion percentage
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

      // Filter out subjects with no activity at all
      const activeSubjects = Array.from(subjectProgressMap.values())
        .filter(subject => 
          subject.hasFlashcards || 
          subject.hasQuizzes || 
          subject.hasNotes || 
          subject.hasStudyPlans || 
          subject.sessionCount > 0
        )
        .sort((a, b) => b.completionPercentage - a.completionPercentage);

      // Calculate overall metrics
      const totalStudyTime = Math.round(
        studySessions.data?.reduce((total, session) => 
          total + Math.floor((session.duration || 0) / 3600), 0
        ) || 0
      );

      const sessionsThisWeek = recentSessions7Days.data?.length || 0;
      
      const averageScore = activeSubjects.length > 0 
        ? Math.round(activeSubjects.reduce((acc, s) => acc + s.averageScore, 0) / activeSubjects.length)
        : 0;

      // Calculate totals for formatted strings
      const total7DaysTime = activeSubjects.reduce((sum, s) => sum + s.last7DaysTime, 0);
      const total7DaysSessions = activeSubjects.reduce((sum, s) => sum + s.last7DaysSessions, 0);
      const total30DaysTime = activeSubjects.reduce((sum, s) => sum + s.last30DaysTime, 0);
      const total30DaysSessions = activeSubjects.reduce((sum, s) => sum + s.last30DaysSessions, 0);

      console.log('✅ Enhanced subject analytics calculated for', activeSubjects.length, 'subjects');

      return {
        subjects: activeSubjects,
        totalStudyTime,
        sessionsThisWeek,
        averageScore,
        longestStreak: 0, // Will be calculated separately
        last7DaysFormatted: formatTimeAndSessions(total7DaysTime, total7DaysSessions),
        last30DaysFormatted: formatTimeAndSessions(total30DaysTime, total30DaysSessions)
      } as SaaSOptimizedSubjectAnalytics;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes memory retention
  });

  return {
    subjectAnalytics: subjectAnalytics || {
      subjects: [],
      totalStudyTime: 0,
      sessionsThisWeek: 0,
      averageScore: 0,
      longestStreak: 0,
      last7DaysFormatted: '0m in 0 sessions',
      last30DaysFormatted: '0m in 0 sessions'
    },
    isLoading
  };
};

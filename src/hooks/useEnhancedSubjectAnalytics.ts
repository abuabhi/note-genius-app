
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
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

export interface SubjectSuggestion {
  subject: string;
  reason: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EnhancedSubjectAnalytics {
  subjects: SubjectProgress[];
  totalStudyTimeHours: number;
  totalStudyTimeMinutes: number;
  sessionsThisWeek: number;
  averageScore: number;
  longestStreak: number;
  last7DaysMinutes: number;
  last30DaysMinutes: number;
  weeklyAverageMinutes: number;
  monthlyAverageMinutes: number;
  dailyAverageMinutes: number;
  suggestions: SubjectSuggestion[];
}

export const useEnhancedSubjectAnalytics = () => {
  const { user } = useAuth();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['enhanced-subject-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🔍 Fetching enhanced subject analytics for user:', user.id);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      console.log('📅 Date ranges calculated:', {
        sevenDaysAgo: sevenDaysAgo.toISOString(),
        thirtyDaysAgo: thirtyDaysAgo.toISOString(),
        startOfWeek: startOfWeek.toISOString()
      });

      // Fetch user subjects
      const { data: userSubjects, error: subjectsError } = await supabase
        .from('user_subjects')
        .select('*')
        .eq('user_id', user.id);

      if (subjectsError) {
        console.error('❌ Error fetching user subjects:', subjectsError);
        throw subjectsError;
      }

      console.log('📚 User subjects fetched:', userSubjects?.length || 0);

      // Fetch study sessions
      const { data: studySessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .not('duration', 'is', null)
        .order('start_time', { ascending: false });

      if (sessionsError) {
        console.error('❌ Error fetching study sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('📖 Study sessions fetched:', studySessions?.length || 0);

      // Fetch flashcard sets with basic data only
      const { data: flashcardSets, error: flashcardsError } = await supabase
        .from('flashcard_sets')
        .select('id, subject, title, user_id')
        .eq('user_id', user.id);

      if (flashcardsError) {
        console.error('❌ Error fetching flashcard sets:', flashcardsError);
        throw flashcardsError;
      }

      console.log('🃏 Flashcard sets fetched:', flashcardSets?.length || 0);

      // Fetch flashcard progress separately
      const { data: flashcardProgress, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('flashcard_id, mastery_level, grade')
        .eq('user_id', user.id);

      if (progressError) {
        console.error('❌ Error fetching flashcard progress:', progressError);
        throw progressError;
      }

      console.log('📊 Flashcard progress fetched:', flashcardProgress?.length || 0);

      // Fetch quiz results
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select(`
          *,
          quizzes!inner(
            subject_id,
            academic_subjects(name)
          )
        `)
        .eq('user_id', user.id)
        .gte('completed_at', thirtyDaysAgo.toISOString());

      if (quizError) {
        console.error('❌ Error fetching quiz results:', quizError);
        throw quizError;
      }

      console.log('🧠 Quiz results fetched:', quizResults?.length || 0);

      // Calculate total study time
      const allSessions = studySessions || [];
      const totalStudyTimeMinutes = allSessions.reduce((total, session) => {
        return total + Math.floor((session.duration || 0) / 60);
      }, 0);

      console.log('⏱️ Total study time calculated:', totalStudyTimeMinutes, 'minutes');

      // Calculate sessions this week
      const sessionsThisWeek = allSessions.filter(session => 
        new Date(session.start_time) >= startOfWeek
      ).length;

      console.log('📅 Sessions this week:', sessionsThisWeek);

      // Calculate time periods
      const last7DaysMinutes = allSessions
        .filter(session => new Date(session.start_time) >= sevenDaysAgo)
        .reduce((total, session) => total + Math.floor((session.duration || 0) / 60), 0);

      const last30DaysMinutes = allSessions
        .filter(session => new Date(session.start_time) >= thirtyDaysAgo)
        .reduce((total, session) => total + Math.floor((session.duration || 0) / 60), 0);

      console.log('📊 Time periods calculated:', { last7DaysMinutes, last30DaysMinutes });

      // Calculate averages
      const weeklyAverageMinutes = Math.round(last30DaysMinutes / 4);
      const monthlyAverageMinutes = last30DaysMinutes;
      const dailyAverageMinutes = Math.round(last7DaysMinutes / 7);

      // Calculate longest streak
      const sessionDates = allSessions
        .map(session => new Date(session.start_time).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort();

      let longestStreak = 0;
      let currentStreak = 1;

      for (let i = 1; i < sessionDates.length; i++) {
        const prevDate = new Date(sessionDates[i - 1]);
        const currDate = new Date(sessionDates[i]);
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);

      console.log('🔥 Longest streak calculated:', longestStreak);

      // Initialize subjects map
      const subjectProgressMap = new Map<string, SubjectProgress>();
      
      (userSubjects || []).forEach(subject => {
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

      // Process study sessions by subject
      allSessions.forEach(session => {
        if (session.subject && subjectProgressMap.has(session.subject)) {
          const subject = subjectProgressMap.get(session.subject)!;
          subject.totalStudyTimeMinutes += Math.floor((session.duration || 0) / 60);
          subject.sessionCount += 1;
        }
      });

      // Process flashcard mastery
      const flashcardsBySubject = new Map<string, number[]>();
      (flashcardSets || []).forEach(set => {
        if (set.subject) {
          if (!flashcardsBySubject.has(set.subject)) {
            flashcardsBySubject.set(set.subject, []);
          }
        }
      });

      (flashcardProgress || []).forEach(progress => {
        // Find which subject this flashcard belongs to
        const flashcardSet = (flashcardSets || []).find(set => 
          // We'd need to match via flashcard table, for now use mastery level directly
          progress.mastery_level >= 4
        );
        if (progress.mastery_level >= 4) {
          // Add to general mastery calculation
        }
      });

      // Process quiz performance
      const quizBySubject = new Map<string, number[]>();
      (quizResults || []).forEach(result => {
        const subjectName = result.quizzes?.academic_subjects?.name;
        if (subjectName) {
          if (!quizBySubject.has(subjectName)) {
            quizBySubject.set(subjectName, []);
          }
          const score = Math.round((result.score / result.total_questions) * 100);
          quizBySubject.get(subjectName)!.push(score);
        }
      });

      // Calculate average quiz performance
      const allQuizScores: number[] = [];
      quizBySubject.forEach((scores, subjectName) => {
        if (subjectProgressMap.has(subjectName)) {
          const subject = subjectProgressMap.get(subjectName)!;
          const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          subject.averageScore = avgScore;
          subject.quizPerformance = avgScore;
          allQuizScores.push(...scores);
        }
      });

      const overallAverageScore = allQuizScores.length > 0 
        ? Math.round(allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length)
        : 0;

      // Finalize subject calculations
      const subjects = Array.from(subjectProgressMap.values()).map(subject => {
        // Calculate completion percentage
        const flashcardWeight = 0.3;
        const quizWeight = 0.4;
        const consistencyWeight = 0.3;
        
        subject.studyConsistency = Math.min(Math.round((subject.sessionCount / 10) * 100), 100);
        subject.completionPercentage = Math.round(
          (subject.flashcardMastery * flashcardWeight) +
          (subject.quizPerformance * quizWeight) +
          (subject.studyConsistency * consistencyWeight)
        );

        // Assign color based on completion
        if (subject.completionPercentage >= 80) {
          subject.color = 'green';
        } else if (subject.completionPercentage >= 50) {
          subject.color = 'yellow';
        } else {
          subject.color = 'red';
        }

        return subject;
      }).sort((a, b) => b.completionPercentage - a.completionPercentage);

      // Generate suggestions
      const suggestions: SubjectSuggestion[] = [];
      
      subjects.forEach(subject => {
        if (subject.completionPercentage < 50) {
          suggestions.push({
            subject: subject.name,
            reason: `Low completion rate (${subject.completionPercentage}%)`,
            action: 'Create more flashcards or take practice quizzes',
            priority: 'high'
          });
        } else if (subject.sessionCount < 5) {
          suggestions.push({
            subject: subject.name,
            reason: 'Few study sessions',
            action: 'Schedule more regular study sessions',
            priority: 'medium'
          });
        }
      });

      console.log('✅ Analytics calculation completed successfully');

      return {
        subjects,
        totalStudyTimeHours: Math.round(totalStudyTimeMinutes / 60 * 10) / 10,
        totalStudyTimeMinutes,
        sessionsThisWeek,
        averageScore: overallAverageScore,
        longestStreak,
        last7DaysMinutes,
        last30DaysMinutes,
        weeklyAverageMinutes,
        monthlyAverageMinutes,
        dailyAverageMinutes,
        suggestions
      } as EnhancedSubjectAnalytics;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 5 * 60 * 1000, // 5 minutes memory retention
  });

  return {
    subjectAnalytics: analyticsData || {
      subjects: [],
      totalStudyTimeHours: 0,
      totalStudyTimeMinutes: 0,
      sessionsThisWeek: 0,
      averageScore: 0,
      longestStreak: 0,
      last7DaysMinutes: 0,
      last30DaysMinutes: 0,
      weeklyAverageMinutes: 0,
      monthlyAverageMinutes: 0,
      dailyAverageMinutes: 0,
      suggestions: []
    },
    isLoading
  };
};

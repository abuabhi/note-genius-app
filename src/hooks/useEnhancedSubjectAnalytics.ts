
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
  masteredCards: number;
  totalCards: number;
}

export interface SubjectSuggestion {
  name: string;
  reason: string;
  confidence: number;
  basedOn: string[];
}

export interface EnhancedSubjectAnalytics {
  subjects: SubjectProgress[];
  totalStudyTimeHours: number;
  totalStudyTimeMinutes: number;
  sessionsThisWeek: number;
  last7DaysMinutes: number;
  last30DaysMinutes: number;
  longestStreak: number;
  weeklyAverageMinutes: number;
  monthlyAverageMinutes: number;
  dailyAverageMinutes: number;
  suggestions: SubjectSuggestion[];
  performanceSummary: {
    excelling: number;
    progressing: number;
    needsAttention: number;
  };
}

export const useEnhancedSubjectAnalytics = () => {
  const { user } = useAuth();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['enhanced-subject-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🔍 Fetching enhanced subject analytics data');

      // Calculate date ranges
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      thisWeekStart.setHours(0, 0, 0, 0);

      // Parallel data fetching
      const [
        userSubjects,
        studySessions,
        flashcardSets,
        quizResults,
        allFlashcards
      ] = await Promise.all([
        supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id),
        
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .not('duration', 'is', null)
          .gte('start_time', last30Days.toISOString()),
        
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
          .gte('completed_at', last30Days.toISOString()),
        
        supabase
          .from('flashcards')
          .select('*')
          .in(
            'flashcard_set_id',
            (await supabase
              .from('flashcard_sets')
              .select('id')
              .eq('user_id', user.id)
            ).data?.map(set => set.id) || []
          )
      ]);

      if (userSubjects.error) throw userSubjects.error;
      if (studySessions.error) throw studySessions.error;
      if (flashcardSets.error) throw flashcardSets.error;
      if (quizResults.error) throw quizResults.error;

      const sessions = studySessions.data || [];
      const subjects = userSubjects.data || [];
      const sets = flashcardSets.data || [];
      const results = quizResults.data || [];
      const flashcards = allFlashcards.data || [];

      console.log('📊 Data fetched:', {
        sessions: sessions.length,
        subjects: subjects.length,
        sets: sets.length,
        results: results.length,
        flashcards: flashcards.length
      });

      // Calculate time-based metrics
      const totalStudyTimeMinutes = sessions.reduce((acc, session) => 
        acc + Math.floor((session.duration || 0) / 60), 0
      );
      
      const last7DaysSessions = sessions.filter(s => 
        new Date(s.start_time) >= last7Days
      );
      const last7DaysMinutes = last7DaysSessions.reduce((acc, session) => 
        acc + Math.floor((session.duration || 0) / 60), 0
      );

      const thisWeekSessions = sessions.filter(s => 
        new Date(s.start_time) >= thisWeekStart
      );
      const sessionsThisWeek = thisWeekSessions.length;

      // Calculate averages
      const weeklyAverageMinutes = Math.round(totalStudyTimeMinutes / 4); // 4 weeks
      const monthlyAverageMinutes = totalStudyTimeMinutes;
      const dailyAverageMinutes = Math.round(last7DaysMinutes / 7);

      // Calculate streak
      const studyDates = [...new Set(sessions.map(s => s.start_time.split('T')[0]))].sort().reverse();
      let longestStreak = 0;
      if (studyDates.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        if (studyDates.includes(today)) {
          longestStreak = 1;
          for (let i = 1; i < studyDates.length; i++) {
            const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            if (studyDates.includes(expectedDate)) {
              longestStreak++;
            } else {
              break;
            }
          }
        }
      }

      // Process subjects
      const subjectProgressMap = new Map<string, SubjectProgress>();
      
      subjects.forEach(subject => {
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
          masteredCards: 0,
          totalCards: 0
        });
      });

      // Calculate study time per subject
      sessions.forEach(session => {
        if (session.subject && subjectProgressMap.has(session.subject)) {
          const subject = subjectProgressMap.get(session.subject)!;
          subject.totalStudyTimeMinutes += Math.floor((session.duration || 0) / 60);
          subject.sessionCount += 1;
        }
      });

      // Calculate flashcard mastery
      sets.forEach(set => {
        if (set.subject && subjectProgressMap.has(set.subject)) {
          const subject = subjectProgressMap.get(set.subject)!;
          const setFlashcards = set.flashcards || [];
          
          if (setFlashcards.length > 0) {
            const masteredCards = setFlashcards.filter(card => 
              card.user_flashcard_progress?.[0]?.mastery_level >= 4
            ).length;
            subject.masteredCards += masteredCards;
            subject.totalCards += setFlashcards.length;
            subject.flashcardMastery = Math.round((subject.masteredCards / subject.totalCards) * 100);
          }
        }
      });

      // Calculate quiz performance
      const quizBySubject = new Map<string, number[]>();
      results.forEach(result => {
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
      const recentSessions = sessions.filter(s => 
        new Date(s.start_time) >= new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      );

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
          subject.studyConsistency = Math.min(Math.round((count / 4) * 25), 100);
        }
      });

      // Calculate final completion percentage and assign colors
      const processedSubjects = Array.from(subjectProgressMap.values()).map(subject => {
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

      // Generate intelligent subject suggestions
      const suggestions = generateSubjectSuggestions(sets, results, sessions, processedSubjects);

      // Calculate performance summary
      const performanceSummary = {
        excelling: processedSubjects.filter(s => s.completionPercentage >= 85).length,
        progressing: processedSubjects.filter(s => s.completionPercentage >= 60 && s.completionPercentage < 85).length,
        needsAttention: processedSubjects.filter(s => s.completionPercentage < 60).length,
      };

      console.log('✅ Enhanced analytics calculated successfully');

      return {
        subjects: processedSubjects,
        totalStudyTimeHours: Math.round((totalStudyTimeMinutes / 60) * 10) / 10,
        totalStudyTimeMinutes,
        sessionsThisWeek,
        last7DaysMinutes,
        last30DaysMinutes: totalStudyTimeMinutes,
        longestStreak,
        weeklyAverageMinutes,
        monthlyAverageMinutes,
        dailyAverageMinutes,
        suggestions,
        performanceSummary
      } as EnhancedSubjectAnalytics;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    analyticsData: analyticsData || {
      subjects: [],
      totalStudyTimeHours: 0,
      totalStudyTimeMinutes: 0,
      sessionsThisWeek: 0,
      last7DaysMinutes: 0,
      last30DaysMinutes: 0,
      longestStreak: 0,
      weeklyAverageMinutes: 0,
      monthlyAverageMinutes: 0,
      dailyAverageMinutes: 0,
      suggestions: [],
      performanceSummary: {
        excelling: 0,
        progressing: 0,
        needsAttention: 0
      }
    },
    isLoading
  };
};

// Helper function to generate intelligent subject suggestions
function generateSubjectSuggestions(
  flashcardSets: any[],
  quizResults: any[],
  studySessions: any[],
  existingSubjects: SubjectProgress[]
): SubjectSuggestion[] {
  const suggestions: SubjectSuggestion[] = [];
  const existingSubjectNames = new Set(existingSubjects.map(s => s.name.toLowerCase()));

  // Extract subjects from flashcard sets
  const flashcardSubjects = flashcardSets
    .map(set => set.subject)
    .filter(subject => subject && !existingSubjectNames.has(subject.toLowerCase()));

  // Extract subjects from quiz results
  const quizSubjects = quizResults
    .map(result => result.quizzes?.academic_subjects?.name)
    .filter(subject => subject && !existingSubjectNames.has(subject.toLowerCase()));

  // Extract subjects from study sessions
  const sessionSubjects = studySessions
    .map(session => session.subject)
    .filter(subject => subject && !existingSubjectNames.has(subject.toLowerCase()));

  // Count frequency and create suggestions
  const subjectFrequency = new Map<string, { count: number; sources: string[] }>();
  
  flashcardSubjects.forEach(subject => {
    const key = subject.toLowerCase();
    if (!subjectFrequency.has(key)) {
      subjectFrequency.set(key, { count: 0, sources: [] });
    }
    const data = subjectFrequency.get(key)!;
    data.count += 1;
    if (!data.sources.includes('flashcards')) data.sources.push('flashcards');
  });

  quizSubjects.forEach(subject => {
    const key = subject.toLowerCase();
    if (!subjectFrequency.has(key)) {
      subjectFrequency.set(key, { count: 0, sources: [] });
    }
    const data = subjectFrequency.get(key)!;
    data.count += 1;
    if (!data.sources.includes('quizzes')) data.sources.push('quizzes');
  });

  sessionSubjects.forEach(subject => {
    const key = subject.toLowerCase();
    if (!subjectFrequency.has(key)) {
      subjectFrequency.set(key, { count: 0, sources: [] });
    }
    const data = subjectFrequency.get(key)!;
    data.count += 1;
    if (!data.sources.includes('study sessions')) data.sources.push('study sessions');
  });

  // Convert to suggestions
  Array.from(subjectFrequency.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .forEach(([subject, data]) => {
      const confidence = Math.min(data.count * 20, 100);
      suggestions.push({
        name: subject.charAt(0).toUpperCase() + subject.slice(1),
        reason: `Based on your ${data.sources.join(', ')}`,
        confidence,
        basedOn: data.sources
      });
    });

  // Add default suggestions if no data-based suggestions
  if (suggestions.length === 0) {
    const defaultSuggestions = [
      { name: 'Mathematics', reason: 'Popular subject', confidence: 70, basedOn: ['general'] },
      { name: 'Science', reason: 'Core academic subject', confidence: 65, basedOn: ['general'] },
      { name: 'History', reason: 'Commonly studied', confidence: 60, basedOn: ['general'] },
      { name: 'Literature', reason: 'Language arts', confidence: 55, basedOn: ['general'] },
      { name: 'Geography', reason: 'Social studies', confidence: 50, basedOn: ['general'] }
    ];
    suggestions.push(...defaultSuggestions.slice(0, 3));
  }

  return suggestions;
}


import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryDeduplication } from '@/hooks/notes/useQueryDeduplication';
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

export interface EnhancedSubjectAnalytics {
  subjects: SubjectProgress[];
  totalStudyTime: number;
  sessionsThisWeek: number;
  last7Days: number;
  last30Days: number;
  averageScore: number;
  longestStreak: number;
  weeklyAverage: number;
  monthlyAverage: number;
}

export const useSaaSOptimizedSubjectAnalytics = () => {
  const { user } = useAuth();
  const { deduplicateQuery } = useQueryDeduplication();

  const { data: subjectAnalytics, isLoading, error } = useQuery({
    queryKey: ['saas-optimized-subject-analytics', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🚀 Fetching SaaS-optimized subject analytics for user:', user.id);

      return deduplicateQuery(
        `analytics-${user.id}`,
        async () => {
          // Get current date boundaries for different time periods
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          
          const last7Days = new Date(now);
          last7Days.setDate(now.getDate() - 7);
          
          const last30Days = new Date(now);
          last30Days.setDate(now.getDate() - 30);

          // Parallel optimized queries with proper error handling
          const [userSubjects, flashcardSets, quizResults, studySessions] = await Promise.all([
            supabase
              .from('user_subjects')
              .select('id, name')
              .eq('user_id', user.id)
              .then(({ data, error }) => {
                if (error) {
                  console.warn('User subjects query failed:', error);
                  return { data: [] };
                }
                return { data: data || [] };
              }),
            
            supabase
              .from('flashcard_sets')
              .select(`
                id,
                name,
                subject,
                flashcards!inner(
                  id,
                  user_flashcard_progress(mastery_level, grade)
                )
              `)
              .eq('user_id', user.id)
              .then(({ data, error }) => {
                if (error) {
                  console.warn('Flashcard sets query failed:', error);
                  return { data: [] };
                }
                return { data: data || [] };
              }),
            
            supabase
              .from('quiz_results')
              .select(`
                score,
                total_questions,
                completed_at,
                quizzes!inner(
                  subject_id,
                  academic_subjects(name)
                )
              `)
              .eq('user_id', user.id)
              .gte('completed_at', last30Days.toISOString())
              .then(({ data, error }) => {
                if (error) {
                  console.warn('Quiz results query failed:', error);
                  return { data: [] };
                }
                return { data: data || [] };
              }),
            
            supabase
              .from('study_sessions')
              .select('subject, duration, start_time, cards_reviewed, cards_correct')
              .eq('user_id', user.id)
              .not('duration', 'is', null)
              .gte('start_time', last30Days.toISOString())
              .lte('duration', 43200) // Cap at 12 hours for realistic sessions
              .order('start_time', { ascending: false })
              .then(({ data, error }) => {
                if (error) {
                  console.warn('Study sessions query failed:', error);
                  return { data: [] };
                }
                return { data: data || [] };
              })
          ]);

          console.log('📊 Raw data fetched:', {
            subjects: userSubjects.data?.length || 0,
            flashcardSets: flashcardSets.data?.length || 0,
            quizResults: quizResults.data?.length || 0,
            studySessions: studySessions.data?.length || 0
          });

          // Initialize subject progress map
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

          // Calculate total study time and session counts
          let totalStudyTimeMinutes = 0;
          let sessionsThisWeek = 0;
          let sessionsLast7Days = 0;
          let sessionsLast30Days = 0;

          studySessions.data?.forEach(session => {
            const sessionDate = new Date(session.start_time);
            const durationMinutes = Math.floor((session.duration || 0) / 60);
            
            totalStudyTimeMinutes += durationMinutes;
            sessionsLast30Days++;
            
            if (sessionDate >= last7Days) {
              sessionsLast7Days++;
            }
            
            if (sessionDate >= startOfWeek) {
              sessionsThisWeek++;
            }

            // Add to subject progress if subject exists
            if (session.subject && subjectProgressMap.has(session.subject)) {
              const subject = subjectProgressMap.get(session.subject)!;
              subject.totalStudyTimeMinutes += durationMinutes;
              subject.sessionCount += 1;
            }
          });

          // Calculate flashcard mastery per subject
          flashcardSets.data?.forEach(set => {
            if (set.subject && subjectProgressMap.has(set.subject)) {
              const subject = subjectProgressMap.get(set.subject)!;
              const flashcards = set.flashcards || [];
              
              if (flashcards.length > 0) {
                const masteredCards = flashcards.filter(card => 
                  card.user_flashcard_progress?.[0]?.mastery_level >= 4
                ).length;
                const masteryRate = (masteredCards / flashcards.length) * 100;
                
                // Average mastery across multiple sets for the same subject
                if (subject.flashcardMastery === 0) {
                  subject.flashcardMastery = masteryRate;
                } else {
                  subject.flashcardMastery = (subject.flashcardMastery + masteryRate) / 2;
                }
              }
            }
          });

          // Calculate quiz performance per subject
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

          let totalQuizScore = 0;
          let totalQuizCount = 0;

          quizBySubject.forEach((scores, subjectName) => {
            if (subjectProgressMap.has(subjectName)) {
              const subject = subjectProgressMap.get(subjectName)!;
              const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
              subject.averageScore = Math.round(avgScore);
              subject.quizPerformance = subject.averageScore;
              
              totalQuizScore += avgScore * scores.length;
              totalQuizCount += scores.length;
            }
          });

          // Calculate study consistency (sessions per week over last 4 weeks)
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

          // Calculate final completion percentages and assign colors
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

          // Calculate streak (simplified but accurate)
          const uniqueStudyDates = new Set(
            studySessions.data?.map(s => new Date(s.start_time).toDateString()) || []
          );
          const sortedDates = Array.from(uniqueStudyDates).sort();
          let longestStreak = 0;
          let currentStreak = 0;
          
          for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0 || 
                new Date(sortedDates[i]).getTime() - new Date(sortedDates[i-1]).getTime() === 86400000) {
              currentStreak++;
              longestStreak = Math.max(longestStreak, currentStreak);
            } else {
              currentStreak = 1;
            }
          }

          const result = {
            subjects,
            totalStudyTime: Math.round(totalStudyTimeMinutes / 60 * 100) / 100, // Convert to hours
            sessionsThisWeek,
            last7Days: sessionsLast7Days,
            last30Days: sessionsLast30Days,
            averageScore: totalQuizCount > 0 ? Math.round(totalQuizScore / totalQuizCount) : 0,
            longestStreak,
            weeklyAverage: Math.round((sessionsLast30Days / 4) * 100) / 100,
            monthlyAverage: Math.round((totalStudyTimeMinutes / 60 / 4) * 100) / 100
          } as EnhancedSubjectAnalytics;

          console.log('✅ Analytics calculated successfully:', {
            subjectsCount: result.subjects.length,
            totalStudyTime: result.totalStudyTime,
            sessionsThisWeek: result.sessionsThisWeek,
            last7Days: result.last7Days,
            last30Days: result.last30Days
          });

          return result;
        }
      );
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for SaaS performance
    gcTime: 10 * 60 * 1000, // 10 minutes memory retention
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const fallbackData = useMemo(() => ({
    subjects: [],
    totalStudyTime: 0,
    sessionsThisWeek: 0,
    last7Days: 0,
    last30Days: 0,
    averageScore: 0,
    longestStreak: 0,
    weeklyAverage: 0,
    monthlyAverage: 0
  }), []);

  return {
    subjectAnalytics: subjectAnalytics || fallbackData,
    isLoading,
    error
  };
};

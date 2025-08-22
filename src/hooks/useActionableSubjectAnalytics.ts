import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { standardizeSubjectName } from '@/utils/subjectStandardization';

interface ActionableSubjectData {
  id: string;
  name: string;
  totalStudyTimeMinutes: number;
  sessionCount: number;
  weeklyStudyMinutes: number;
  goalProgress?: {
    goalId: string;
    targetHours: number;
    currentHours: number;
    progressPercentage: number;
    daysRemaining: number;
    isOnTrack: boolean;
    hoursBehindAhead: number;
    endDate: string;
  };
  studyPattern: {
    averageSessionMinutes: number;
    mostActiveDay: string;
    studyFrequency: number; // sessions per week
    lastStudyDate: string | null;
    daysSinceLastStudy: number;
  };
  resources: {
    flashcardSets: number;
    quizzes: number;
    notes: number;
  };
  recommendations: string[];
}

interface ActionableAnalyticsResponse {
  subjects: ActionableSubjectData[];
  totalStudyTimeHours: number;
  weeklyStudyHours: number;
  activeGoalsCount: number;
  studyStreak: number;
  insights: {
    type: 'goal' | 'time' | 'pattern';
    message: string;
    actionable: boolean;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export const useActionableSubjectAnalytics = () => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['actionable-subject-analytics', user?.id],
    queryFn: async (): Promise<ActionableAnalyticsResponse> => {
      if (!user?.id) {
        return {
          subjects: [],
          totalStudyTimeHours: 0,
          weeklyStudyHours: 0,
          activeGoalsCount: 0,
          studyStreak: 0,
          insights: [],
        };
      }

      try {
        // Fetch data in parallel
        const [
          { data: studySessions },
          { data: studyGoals },
          { data: flashcardSets },
          { data: quizzes },
          { data: notes }
        ] = await Promise.all([
          supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', user.id)
            .eq('auto_created', false)
            .gte('start_time', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
            .order('start_time', { ascending: false }),
          
          supabase
            .from('study_goals')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active'),
          
          supabase
            .from('flashcard_sets')
            .select('id, subject')
            .eq('user_id', user.id),
          
          supabase
            .from('quizzes')
            .select('id, title')
            .eq('user_id', user.id),
          
          supabase
            .from('notes')
            .select('id, subject')
            .eq('user_id', user.id)
            .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        // Process study sessions by subject
        const subjectMap = new Map<string, ActionableSubjectData>();
        const completedSessions = studySessions?.filter(session => 
          !session.is_active && session.duration && session.duration > 0
        ) || [];

        // Build subject data from study sessions (time-first approach)
        completedSessions.forEach(session => {
          if (!session.subject) return;
          
          const standardizedSubject = standardizeSubjectName(session.subject, 'session');
          const subject = subjectMap.get(standardizedSubject) || {
            id: standardizedSubject,
            name: standardizedSubject,
            totalStudyTimeMinutes: 0,
            sessionCount: 0,
            weeklyStudyMinutes: 0,
            studyPattern: {
              averageSessionMinutes: 0,
              mostActiveDay: '',
              studyFrequency: 0,
              lastStudyDate: null,
              daysSinceLastStudy: 0,
            },
            resources: {
              flashcardSets: 0,
              quizzes: 0,
              notes: 0,
            },
            recommendations: [],
          };

          const sessionMinutes = Math.floor(session.duration / 60);
          subject.totalStudyTimeMinutes += sessionMinutes;
          subject.sessionCount += 1;

          // Calculate weekly study time
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          if (new Date(session.start_time) >= oneWeekAgo) {
            subject.weeklyStudyMinutes += sessionMinutes;
          }

          // Update last study date
          if (!subject.studyPattern.lastStudyDate || 
              new Date(session.start_time) > new Date(subject.studyPattern.lastStudyDate)) {
            subject.studyPattern.lastStudyDate = session.start_time;
          }

          subjectMap.set(standardizedSubject, subject);
        });

        // Calculate study patterns
        subjectMap.forEach((subject, subjectName) => {
          const subjectSessions = completedSessions.filter(session => 
            standardizeSubjectName(session.subject || '', 'session') === subjectName
          );

          // Average session time
          subject.studyPattern.averageSessionMinutes = subject.sessionCount > 0 
            ? Math.round(subject.totalStudyTimeMinutes / subject.sessionCount)
            : 0;

          // Most active day
          const dayFrequency = new Map<string, number>();
          subjectSessions.forEach(session => {
            const day = new Date(session.start_time).toLocaleDateString('en-US', { weekday: 'long' });
            dayFrequency.set(day, (dayFrequency.get(day) || 0) + 1);
          });
          
          subject.studyPattern.mostActiveDay = Array.from(dayFrequency.entries())
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

          // Study frequency (sessions per week)
          const totalWeeks = 12; // Last 90 days ≈ 12 weeks
          subject.studyPattern.studyFrequency = Math.round((subject.sessionCount / totalWeeks) * 10) / 10;

          // Days since last study
          if (subject.studyPattern.lastStudyDate) {
            const daysSince = Math.floor(
              (Date.now() - new Date(subject.studyPattern.lastStudyDate).getTime()) / (1000 * 60 * 60 * 24)
            );
            subject.studyPattern.daysSinceLastStudy = daysSince;
          }
        });

        // Add goal progress for subjects
        studyGoals?.forEach(goal => {
          if (!goal.academic_subject) return;
          
          const standardizedSubject = standardizeSubjectName(goal.academic_subject, 'session');
          const subject = subjectMap.get(standardizedSubject);
          
          if (subject) {
            const goalStartDate = new Date(goal.start_date);
            const goalEndDate = new Date(goal.end_date);
            const totalDays = Math.ceil((goalEndDate.getTime() - goalStartDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysPassed = Math.ceil((Date.now() - goalStartDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysRemaining = Math.max(0, totalDays - daysPassed);
            
            const currentHours = subject.totalStudyTimeMinutes / 60;
            const progressPercentage = Math.min(100, Math.round((currentHours / goal.target_hours) * 100));
            
            // Calculate if on track
            const expectedProgress = Math.min(1, daysPassed / totalDays);
            const actualProgress = currentHours / goal.target_hours;
            const hoursBehindAhead = (actualProgress - expectedProgress) * goal.target_hours;
            
            subject.goalProgress = {
              goalId: goal.id,
              targetHours: goal.target_hours,
              currentHours: Math.round(currentHours * 10) / 10,
              progressPercentage,
              daysRemaining,
              isOnTrack: hoursBehindAhead >= -1, // Allow 1 hour tolerance
              hoursBehindAhead: Math.round(hoursBehindAhead * 10) / 10,
              endDate: goal.end_date,
            };
          }
        });

        // Count resources by subject
        flashcardSets?.forEach(set => {
          if (!set.subject) return;
          const standardizedSubject = standardizeSubjectName(set.subject, 'flashcard');
          const subject = subjectMap.get(standardizedSubject);
          if (subject) {
            subject.resources.flashcardSets += 1;
          }
        });

        quizzes?.forEach(quiz => {
          if (!quiz.title) return;
          const standardizedSubject = standardizeSubjectName(quiz.title, 'quiz');
          const subject = subjectMap.get(standardizedSubject);
          if (subject) {
            subject.resources.quizzes += 1;
          }
        });

        notes?.forEach(note => {
          if (!note.subject) return;
          const standardizedSubject = standardizeSubjectName(note.subject, 'note');
          const subject = subjectMap.get(standardizedSubject);
          if (subject) {
            subject.resources.notes += 1;
          }
        });

        // Generate recommendations for each subject
        subjectMap.forEach(subject => {
          const recommendations = [];
          
          // Goal-based recommendations
          if (subject.goalProgress) {
            if (!subject.goalProgress.isOnTrack) {
              recommendations.push(`You're ${Math.abs(subject.goalProgress.hoursBehindAhead)}h behind your goal. Consider increasing study time.`);
            } else if (subject.goalProgress.hoursBehindAhead > 2) {
              recommendations.push(`Great job! You're ${subject.goalProgress.hoursBehindAhead}h ahead of your goal.`);
            }
          } else if (subject.totalStudyTimeMinutes > 60) {
            recommendations.push(`Set a study goal to track progress more effectively.`);
          }

          // Time-based recommendations
          if (subject.studyPattern.daysSinceLastStudy > 7) {
            recommendations.push(`It's been ${subject.studyPattern.daysSinceLastStudy} days since your last study session.`);
          } else if (subject.studyPattern.daysSinceLastStudy > 3) {
            recommendations.push(`Consider scheduling a study session soon.`);
          }

          // Resource-based recommendations
          if (subject.resources.flashcardSets === 0 && subject.totalStudyTimeMinutes > 120) {
            recommendations.push(`Create flashcards to reinforce your learning.`);
          }
          
          if (subject.resources.quizzes === 0 && subject.totalStudyTimeMinutes > 180) {
            recommendations.push(`Test your knowledge with a quiz.`);
          }

          subject.recommendations = recommendations.slice(0, 2); // Limit to 2 recommendations
        });

        // Calculate overall statistics
        const subjects = Array.from(subjectMap.values()).filter(subject => 
          subject.totalStudyTimeMinutes > 0 // Only show subjects with actual study time
        );

        const totalStudyTimeHours = subjects.reduce((sum, s) => sum + s.totalStudyTimeMinutes, 0) / 60;
        const weeklyStudyHours = subjects.reduce((sum, s) => sum + s.weeklyStudyMinutes, 0) / 60;
        const activeGoalsCount = studyGoals?.length || 0;

        // Calculate study streak
        const sortedSessions = completedSessions.sort((a, b) => 
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        
        let studyStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 30; i++) { // Check last 30 days
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          checkDate.setHours(0, 0, 0, 0);
          
          const nextDay = new Date(checkDate);
          nextDay.setDate(checkDate.getDate() + 1);
          
          const hasStudyOnDay = sortedSessions.some(session => {
            const sessionDate = new Date(session.start_time);
            return sessionDate >= checkDate && sessionDate < nextDay;
          });
          
          if (hasStudyOnDay) {
            studyStreak++;
          } else {
            break;
          }
        }

        // Generate insights
        const insights = [];
        
        // Goal insights
        const goalsWithProgress = subjects.filter(s => s.goalProgress);
        const behindGoals = goalsWithProgress.filter(s => !s.goalProgress!.isOnTrack);
        
        if (behindGoals.length > 0) {
          insights.push({
            type: 'goal' as const,
            message: `${behindGoals.length} subject${behindGoals.length > 1 ? 's are' : ' is'} behind schedule`,
            actionable: true,
            priority: 'high' as const,
          });
        }

        // Time insights
        if (weeklyStudyHours < 5 && totalStudyTimeHours > 10) {
          insights.push({
            type: 'time' as const,
            message: 'Your study time has decreased this week. Consider scheduling more sessions.',
            actionable: true,
            priority: 'medium' as const,
          });
        }

        // Pattern insights
        const subjectsNotStudiedThisWeek = subjects.filter(s => s.weeklyStudyMinutes === 0);
        if (subjectsNotStudiedThisWeek.length > 0) {
          insights.push({
            type: 'pattern' as const,
            message: `${subjectsNotStudiedThisWeek.length} subject${subjectsNotStudiedThisWeek.length > 1 ? 's haven\'t' : ' hasn\'t'} been studied this week`,
            actionable: true,
            priority: 'medium' as const,
          });
        }

        return {
          subjects: subjects.sort((a, b) => b.totalStudyTimeMinutes - a.totalStudyTimeMinutes),
          totalStudyTimeHours: Math.round(totalStudyTimeHours * 10) / 10,
          weeklyStudyHours: Math.round(weeklyStudyHours * 10) / 10,
          activeGoalsCount,
          studyStreak,
          insights: insights.slice(0, 3), // Limit to 3 insights
        };

      } catch (error) {
        console.error('❌ Error fetching actionable subject analytics:', error);
        return {
          subjects: [],
          totalStudyTimeHours: 0,
          weeklyStudyHours: 0,
          activeGoalsCount: 0,
          studyStreak: 0,
          insights: [],
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    analytics: query.data || {
      subjects: [],
      totalStudyTimeHours: 0,
      weeklyStudyHours: 0,
      activeGoalsCount: 0,
      studyStreak: 0,
      insights: [],
    },
    isLoading: query.isLoading,
    error: query.error,
  };
};
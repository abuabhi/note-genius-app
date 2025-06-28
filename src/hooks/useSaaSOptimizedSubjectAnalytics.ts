
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export interface SubjectAnalytics {
  subjects: Array<{
    id: string;
    name: string;
    completionPercentage: number;
    totalStudyTimeMinutes: number;
    sessionCount: number;
    activityTypes: string[];
    flashcardProgress?: {
      totalCards: number;
      masteredCards: number;
      averageGrade: string;
    };
    quizProgress?: {
      totalAttempts: number;
      averageScore: number;
      bestScore: number;
    };
    studyPlanProgress?: {
      totalSessions: number;
      completedSessions: number;
    };
  }>;
  totalStudyTime: number;
  sessionsThisWeek: number;
  last7DaysFormatted: string | null;
  last30DaysFormatted: string | null;
}

export const useSaaSOptimizedSubjectAnalytics = () => {
  const { user } = useAuth();

  const { data: subjectAnalytics, isLoading } = useQuery({
    queryKey: ['subject-analytics', user?.id],
    queryFn: async (): Promise<SubjectAnalytics> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 Fetching subject analytics for user:', user.id);

      // Get subjects with actual activity only
      const subjectsWithActivity = await getSubjectsWithActivity(user.id);
      
      // Calculate time-based metrics
      const timeMetrics = await calculateTimeMetrics(user.id);

      console.log('📊 Found subjects with activity:', subjectsWithActivity.length);

      return {
        subjects: subjectsWithActivity,
        ...timeMetrics
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    subjectAnalytics: subjectAnalytics || {
      subjects: [],
      totalStudyTime: 0,
      sessionsThisWeek: 0,
      last7DaysFormatted: null,
      last30DaysFormatted: null
    },
    isLoading
  };
};

async function getSubjectsWithActivity(userId: string) {
  const subjects = new Map();

  // 1. Get subjects from flashcard sets with actual progress
  const { data: flashcardData } = await supabase
    .from('flashcard_sets')
    .select(`
      subject,
      id,
      card_count,
      flashcard_set_cards!inner (
        flashcard_id,
        flashcards!inner (
          id,
          user_flashcard_progress!inner (
            mastery_level,
            grade,
            last_reviewed_at
          )
        )
      )
    `)
    .eq('user_id', userId)
    .not('subject', 'is', null);

  if (flashcardData) {
    for (const set of flashcardData) {
      if (!set.subject || !set.flashcard_set_cards?.length) continue;

      const subjectName = set.subject;
      if (!subjects.has(subjectName)) {
        subjects.set(subjectName, {
          id: `subject-${subjectName}`,
          name: subjectName,
          activityTypes: [],
          totalStudyTimeMinutes: 0,
          sessionCount: 0
        });
      }

      const subject = subjects.get(subjectName);
      
      // Calculate flashcard progress
      const totalCards = set.flashcard_set_cards.length;
      const masteredCards = set.flashcard_set_cards.filter(card => 
        card.flashcards?.user_flashcard_progress?.[0]?.mastery_level >= 4
      ).length;
      
      const grades = set.flashcard_set_cards
        .map(card => card.flashcards?.user_flashcard_progress?.[0]?.grade)
        .filter(Boolean);
      
      const averageGrade = calculateAverageGrade(grades);

      if (!subject.flashcardProgress) {
        subject.flashcardProgress = {
          totalCards: 0,
          masteredCards: 0,
          averageGrade: 'C'
        };
      }

      subject.flashcardProgress.totalCards += totalCards;
      subject.flashcardProgress.masteredCards += masteredCards;
      subject.flashcardProgress.averageGrade = averageGrade;

      if (!subject.activityTypes.includes('flashcards')) {
        subject.activityTypes.push('flashcards');
      }
    }
  }

  // 2. Get subjects from quiz results
  const { data: quizData } = await supabase
    .from('quiz_results')
    .select(`
      score,
      total_questions,
      quizzes!inner (
        title,
        subject_id,
        user_subjects!inner (
          name
        )
      )
    `)
    .eq('user_id', userId);

  if (quizData) {
    for (const result of quizData) {
      const subjectName = result.quizzes?.user_subjects?.name;
      if (!subjectName) continue;

      if (!subjects.has(subjectName)) {
        subjects.set(subjectName, {
          id: `subject-${subjectName}`,
          name: subjectName,
          activityTypes: [],
          totalStudyTimeMinutes: 0,
          sessionCount: 0
        });
      }

      const subject = subjects.get(subjectName);
      
      if (!subject.quizProgress) {
        subject.quizProgress = {
          totalAttempts: 0,
          averageScore: 0,
          bestScore: 0
        };
      }

      const scorePercentage = (result.score / result.total_questions) * 100;
      subject.quizProgress.totalAttempts += 1;
      subject.quizProgress.bestScore = Math.max(subject.quizProgress.bestScore, scorePercentage);
      
      // Calculate running average
      const currentTotal = subject.quizProgress.averageScore * (subject.quizProgress.totalAttempts - 1);
      subject.quizProgress.averageScore = (currentTotal + scorePercentage) / subject.quizProgress.totalAttempts;

      if (!subject.activityTypes.includes('quizzes')) {
        subject.activityTypes.push('quizzes');
      }
    }
  }

  // 3. Get subjects from study sessions
  const { data: sessionData } = await supabase
    .from('study_sessions')
    .select('subject, duration, end_time')
    .eq('user_id', userId)
    .not('subject', 'is', null)
    .not('end_time', 'is', null);

  if (sessionData) {
    for (const session of sessionData) {
      if (!session.subject) continue;

      const subjectName = session.subject;
      if (!subjects.has(subjectName)) {
        subjects.set(subjectName, {
          id: `subject-${subjectName}`,
          name: subjectName,
          activityTypes: [],
          totalStudyTimeMinutes: 0,
          sessionCount: 0
        });
      }

      const subject = subjects.get(subjectName);
      subject.sessionCount += 1;
      subject.totalStudyTimeMinutes += Math.floor((session.duration || 0) / 60);

      if (!subject.activityTypes.includes('study_sessions')) {
        subject.activityTypes.push('study_sessions');
      }
    }
  }

  // 4. Get subjects from study plans
  const { data: studyPlanData } = await supabase
    .from('study_plans')
    .select(`
      subject,
      status,
      study_plan_sessions (
        status
      )
    `)
    .eq('user_id', userId);

  if (studyPlanData) {
    for (const plan of studyPlanData) {
      if (!plan.subject) continue;

      const subjectName = plan.subject;
      if (!subjects.has(subjectName)) {
        subjects.set(subjectName, {
          id: `subject-${subjectName}`,
          name: subjectName,
          activityTypes: [],
          totalStudyTimeMinutes: 0,
          sessionCount: 0
        });
      }

      const subject = subjects.get(subjectName);
      
      if (!subject.studyPlanProgress) {
        subject.studyPlanProgress = {
          totalSessions: 0,
          completedSessions: 0
        };
      }

      const sessions = plan.study_plan_sessions || [];
      subject.studyPlanProgress.totalSessions += sessions.length;
      subject.studyPlanProgress.completedSessions += sessions.filter(s => s.status === 'completed').length;

      if (!subject.activityTypes.includes('study_plans')) {
        subject.activityTypes.push('study_plans');
      }
    }
  }

  // Calculate completion percentages for each subject
  const subjectsArray = Array.from(subjects.values()).map(subject => {
    const completionPercentage = calculateSubjectCompletion(subject);
    return {
      ...subject,
      completionPercentage
    };
  });

  console.log('📈 Subjects with calculated progress:', subjectsArray.map(s => ({
    name: s.name,
    completion: s.completionPercentage,
    activities: s.activityTypes
  })));

  return subjectsArray;
}

function calculateSubjectCompletion(subject: any): number {
  const completions = [];

  // Flashcard completion (based on mastery)
  if (subject.flashcardProgress) {
    const { totalCards, masteredCards } = subject.flashcardProgress;
    if (totalCards > 0) {
      completions.push((masteredCards / totalCards) * 100);
    }
  }

  // Quiz completion (based on average score)
  if (subject.quizProgress) {
    completions.push(subject.quizProgress.averageScore);
  }

  // Study plan completion
  if (subject.studyPlanProgress) {
    const { totalSessions, completedSessions } = subject.studyPlanProgress;
    if (totalSessions > 0) {
      completions.push((completedSessions / totalSessions) * 100);
    }
  }

  // Study session engagement (simplified metric)
  if (subject.sessionCount > 0) {
    // Give some base completion for having study sessions
    const engagementScore = Math.min(subject.sessionCount * 10, 80);
    completions.push(engagementScore);
  }

  // Return weighted average if we have multiple completion types
  if (completions.length === 0) return 0;
  
  const average = completions.reduce((sum, comp) => sum + comp, 0) / completions.length;
  return Math.round(Math.min(100, Math.max(0, average)));
}

function calculateAverageGrade(grades: string[]): string {
  if (!grades.length) return 'C';
  
  const gradeValues = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0 };
  const gradeNames = ['F', 'D', 'C', 'B', 'A'];
  
  const average = grades.reduce((sum, grade) => sum + (gradeValues[grade as keyof typeof gradeValues] || 2), 0) / grades.length;
  return gradeNames[Math.round(average)] || 'C';
}

async function calculateTimeMetrics(userId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get study sessions for time calculations
  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('duration, start_time, end_time')
    .eq('user_id', userId)
    .not('end_time', 'is', null)
    .gte('start_time', monthAgo.toISOString());

  if (!sessions?.length) {
    return {
      totalStudyTime: 0,
      sessionsThisWeek: 0,
      last7DaysFormatted: null,
      last30DaysFormatted: null
    };
  }

  const totalMinutes = sessions.reduce((sum, session) => sum + Math.floor((session.duration || 0) / 60), 0);
  const weekSessions = sessions.filter(s => new Date(s.start_time) >= weekAgo);
  const weekMinutes = weekSessions.reduce((sum, session) => sum + Math.floor((session.duration || 0) / 60), 0);

  return {
    totalStudyTime: totalMinutes / 60, // Convert to hours
    sessionsThisWeek: weekSessions.length,
    last7DaysFormatted: formatTime(weekMinutes),
    last30DaysFormatted: formatTime(totalMinutes)
  };
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

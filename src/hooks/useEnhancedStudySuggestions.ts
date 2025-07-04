import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserProgressState } from '@/hooks/useUserProgressState';

export interface EnhancedStudySuggestion {
  id: string;
  type: 'urgent' | 'important' | 'growth' | 'routine' | 'motivation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  icon: '🚨' | '⚡' | '🎯' | '📚' | '🚀' | '✨' | '💪' | '🔥' | '📈' | '🎉' | '📝' | '🧠' | '⏰' | '🎓';
  subject?: string;
  actionUrl?: string;
  metadata?: {
    count?: number;
    daysOverdue?: number;
    lastActivity?: string;
    percentage?: number;
  };
}

interface StudyData {
  notes: any[];
  flashcardSets: any[];
  quizzes: any[];
  goals: any[];
  todos: any[];
  studySessions: any[];
  recentActivity: any[];
}

export const useEnhancedStudySuggestions = (progressState?: UserProgressState) => {
  const { user } = useAuth();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['enhanced-study-suggestions', user?.id, progressState?.userType, progressState?.totalItems],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🚀 Generating enhanced AI study suggestions for user type:', progressState?.userType);

      // Fetch comprehensive user data
      const studyData = await fetchUserStudyData(user.id);
      
      // Generate suggestions based on user type and data
      if (!progressState || progressState.userType === 'new') {
        return generateNewUserSuggestions(studyData);
      }
      
      if (progressState.userType === 'intermediate') {
        return generateIntermediateUserSuggestions(studyData, progressState);
      }
      
      return generateAdvancedUserSuggestions(studyData, progressState);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  return {
    suggestions: suggestions || [],
    isLoading: isLoading || (progressState?.isLoading ?? true)
  };
};

async function fetchUserStudyData(userId: string): Promise<StudyData> {
  const today = new Date();
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    notesResult,
    flashcardsResult, 
    quizzesResult,
    goalsResult,
    todosResult,
    sessionsResult
  ] = await Promise.all([
    supabase
      .from('notes')
      .select('id, title, created_at, updated_at, subject')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    
    supabase
      .from('flashcard_sets')
      .select(`
        id, title, created_at, updated_at, subject,
        flashcards(id),
        user_flashcard_progress(last_reviewed_at, mastery_level)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    
    supabase
      .from('quizzes')
      .select(`
        id, title, created_at, updated_at,
        quiz_results(completed_at, score, total_questions)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
    
    supabase
      .from('study_goals')
      .select('*')
      .eq('user_id', userId)
      .order('end_date', { ascending: true }),
    
    supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'todo')
      .order('due_date', { ascending: true }),
    
    supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', last7Days.toISOString())
      .order('start_time', { ascending: false })
  ]);

  return {
    notes: notesResult.data || [],
    flashcardSets: flashcardsResult.data || [],
    quizzes: quizzesResult.data || [],
    goals: goalsResult.data || [],
    todos: todosResult.data || [],
    studySessions: sessionsResult.data || [],
    recentActivity: [] // Will be calculated from other data
  };
}

function generateNewUserSuggestions(data: StudyData): EnhancedStudySuggestion[] {
  return [
    {
      id: 'create-first-note',
      type: 'growth',
      priority: 'high',
      title: 'Create your first study note',
      description: 'Start building your knowledge base by adding lecture notes, textbook content, or study materials',
      actionable: true,
      icon: '📝',
      actionUrl: '/notes'
    },
    {
      id: 'set-first-goal',
      type: 'important',
      priority: 'high',
      title: 'Set your first study goal',
      description: 'Define what you want to achieve this week to stay motivated and track progress',
      actionable: true,
      icon: '🎯',
      actionUrl: '/goals'
    },
    {
      id: 'discover-ai-features',
      type: 'growth',
      priority: 'medium',
      title: 'Discover AI-powered study tools',
      description: 'Learn how to transform notes into flashcards and quizzes automatically with AI',
      actionable: true,
      icon: '🚀',
      actionUrl: '/help'
    },
    {
      id: 'quick-start-todo',
      type: 'routine',
      priority: 'medium',
      title: 'Add your first study task',
      description: 'Create a todo to organize your daily study activities and stay on track',
      actionable: true,
      icon: '✨',
      actionUrl: '/todos'
    }
  ];
}

function generateIntermediateUserSuggestions(data: StudyData, progressState: UserProgressState): EnhancedStudySuggestion[] {
  const suggestions: EnhancedStudySuggestion[] = [];
  const today = new Date();

  // Check for overdue goals and todos
  const overdueGoals = data.goals.filter(goal => 
    !goal.is_completed && new Date(goal.end_date) < today
  );
  
  const overdueTodos = data.todos.filter(todo => 
    todo.status === 'pending' && todo.due_date && new Date(todo.due_date) < today
  );

  if (overdueGoals.length > 0) {
    const goal = overdueGoals[0];
    const daysOverdue = Math.floor((today.getTime() - new Date(goal.end_date).getTime()) / (1000 * 60 * 60 * 24));
    suggestions.push({
      id: 'overdue-goal',
      type: 'urgent',
      priority: 'critical',
      title: `Complete overdue goal: ${goal.title}`,
      description: `This goal was due ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago and needs immediate attention`,
      actionable: true,
      icon: '🚨',
      actionUrl: '/goals',
      metadata: { daysOverdue, count: overdueGoals.length }
    });
  }

  if (overdueTodos.length > 0) {
    suggestions.push({
      id: 'overdue-todos',
      type: 'urgent',
      priority: 'high',
      title: `${overdueTodos.length} overdue task${overdueTodos.length > 1 ? 's' : ''}`,
      description: 'Complete these overdue tasks to get back on track with your study schedule',
      actionable: true,
      icon: '⚡',
      actionUrl: '/todos',
      metadata: { count: overdueTodos.length }
    });
  }

  // Content expansion suggestions
  if (data.notes.length > 0 && data.flashcardSets.length === 0) {
    suggestions.push({
      id: 'notes-to-flashcards',
      type: 'important',
      priority: 'high',
      title: `Transform ${data.notes.length} notes into flashcards`,
      description: 'Convert your existing notes into interactive flashcards for better memorization and recall',
      actionable: true,
      icon: '🧠',
      actionUrl: '/notes/study/convert',
      metadata: { count: data.notes.length }
    });
  }

  if (data.notes.length > 0 && data.quizzes.length === 0) {
    suggestions.push({
      id: 'create-quiz-from-notes',
      type: 'important',
      priority: 'high',
      title: 'Create quizzes to test your knowledge',
      description: 'Generate quizzes from your notes to identify knowledge gaps and improve retention',
      actionable: true,
      icon: '🎓',
      actionUrl: '/quiz/create',
      metadata: { count: data.notes.length }
    });
  }

  // Study session recommendations
  const todaysSessions = data.studySessions.filter(session => {
    const sessionDate = new Date(session.start_time).toDateString();
    return sessionDate === today.toDateString();
  });

  if (todaysSessions.length === 0 && today.getHours() > 8) {
    suggestions.push({
      id: 'start-daily-session',
      type: 'routine',
      priority: 'medium',
      title: 'Start your daily study session',
      description: 'You haven\'t studied today yet. Even a 15-minute focused session makes a difference',
      actionable: true,
      icon: '⏰',
      actionUrl: '/study-sessions'
    });
  }

  // Review suggestions for existing flashcards
  if (data.flashcardSets.length > 0) {
    const unreviewedSets = data.flashcardSets.filter((set: any) => {
      const lastReviewed = set.user_flashcard_progress?.[0]?.last_reviewed_at;
      if (!lastReviewed) return true;
      const daysSinceReview = (today.getTime() - new Date(lastReviewed).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReview > 2;
    });

    if (unreviewedSets.length > 0) {
      suggestions.push({
        id: 'review-flashcards',
        type: 'important',
        priority: 'medium',
        title: `Review ${unreviewedSets.length} flashcard set${unreviewedSets.length > 1 ? 's' : ''}`,
        description: 'These flashcards haven\'t been reviewed recently. Regular review improves long-term retention',
        actionable: true,
        icon: '📚',
        actionUrl: '/flashcards',
        metadata: { count: unreviewedSets.length }
      });
    }
  }

  // Growth suggestions
  if (data.goals.length === 0) {
    suggestions.push({
      id: 'set-study-goals',
      type: 'growth',
      priority: 'medium',
      title: 'Set study goals to stay motivated',
      description: 'Define clear objectives to maintain motivation and measure your progress effectively',
      actionable: true,
      icon: '🎯',
      actionUrl: '/goals'
    });
  }

  // Motivation based on progress
  suggestions.push({
    id: 'progress-motivation',
    type: 'motivation',
    priority: 'low',
    title: 'Great progress building your study toolkit!',
    description: `You've created ${progressState.totalItems} study items. Keep expanding your knowledge base!`,
    actionable: false,
    icon: '🎉',
    metadata: { count: progressState.totalItems }
  });

  // Ensure we have at least 3-4 suggestions
  return suggestions.slice(0, 4);
}

function generateAdvancedUserSuggestions(data: StudyData, progressState: UserProgressState): EnhancedStudySuggestion[] {
  const suggestions: EnhancedStudySuggestion[] = [];
  const today = new Date();

  // Advanced overdue analysis
  const overdueGoals = data.goals.filter(goal => 
    !goal.is_completed && new Date(goal.end_date) < today
  );
  
  if (overdueGoals.length > 0) {
    suggestions.push({
      id: 'critical-overdue-goals',
      type: 'urgent',
      priority: 'critical',
      title: `${overdueGoals.length} overdue goal${overdueGoals.length > 1 ? 's' : ''} need attention`,
      description: 'These goals require immediate focus to get back on track with your study plans',
      actionable: true,
      icon: '🚨',
      actionUrl: '/goals',
      metadata: { count: overdueGoals.length }
    });
  }

  // Performance analysis
  const recentSessions = data.studySessions.filter(session => {
    const sessionDate = new Date(session.start_time);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return sessionDate >= threeDaysAgo;
  });

  if (recentSessions.length >= 3) {
    suggestions.push({
      id: 'maintain-streak',
      type: 'motivation',
      priority: 'low',
      title: `Amazing! ${recentSessions.length} study sessions this week`,
      description: 'You\'re building excellent study habits. Keep this momentum going for maximum learning',
      actionable: false,
      icon: '🔥',
      metadata: { count: recentSessions.length }
    });
  } else if (recentSessions.length === 0) {
    suggestions.push({
      id: 'resume-routine',
      type: 'important',
      priority: 'high',
      title: 'Resume your study routine',
      description: 'You haven\'t studied in the past few days. Consistency is key to long-term retention',
      actionable: true,
      icon: '⚡',
      actionUrl: '/study-sessions'
    });
  }

  // Advanced content optimization
  const lowMasteryFlashcards = data.flashcardSets.filter((set: any) => {
    const avgMastery = set.user_flashcard_progress?.reduce((sum: number, progress: any) => 
      sum + (progress.mastery_level || 1), 0) / (set.user_flashcard_progress?.length || 1);
    return avgMastery < 3;
  });

  if (lowMasteryFlashcards.length > 0) {
    suggestions.push({
      id: 'improve-mastery',
      type: 'important',
      priority: 'high',
      title: `Focus on ${lowMasteryFlashcards.length} challenging flashcard set${lowMasteryFlashcards.length > 1 ? 's' : ''}`,
      description: 'These sets have low mastery levels and need extra attention for better retention',
      actionable: true,
      icon: '📈',
      actionUrl: '/flashcards',
      metadata: { count: lowMasteryFlashcards.length }
    });
  }

  // Quiz performance analysis
  const recentQuizResults = data.quizzes.flatMap((quiz: any) => 
    quiz.quiz_results?.filter((result: any) => {
      const resultDate = new Date(result.completed_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return resultDate >= weekAgo;
    }) || []
  );

  if (recentQuizResults.length > 0) {
    const avgScore = recentQuizResults.reduce((sum: number, result: any) => 
      sum + (result.score / result.total_questions), 0) / recentQuizResults.length;
    
    if (avgScore < 0.7) {
      suggestions.push({
        id: 'improve-quiz-performance',
        type: 'important',
        priority: 'medium',
        title: 'Improve quiz performance',
        description: `Your recent quiz average is ${Math.round(avgScore * 100)}%. Focus on review and practice`,
        actionable: true,
        icon: '🎓',
        actionUrl: '/quiz',
        metadata: { percentage: Math.round(avgScore * 100) }
      });
    }
  }

  // Study optimization suggestions
  suggestions.push({
    id: 'optimize-schedule',
    type: 'growth',
    priority: 'medium',
    title: 'Optimize your study schedule',
    description: 'Analyze your performance patterns to identify the most effective study times and methods',
    actionable: true,
    icon: '🚀',
    actionUrl: '/analytics'
  });

  // Advanced user motivation
  suggestions.push({
    id: 'advanced-motivation',
    type: 'motivation',
    priority: 'low',
    title: 'You\'re an advanced learner!',
    description: `With ${progressState.totalItems} study items, you've built an impressive knowledge system`,
    actionable: false,
    icon: '💪',
    metadata: { count: progressState.totalItems }
  });

  return suggestions.slice(0, 4);
}
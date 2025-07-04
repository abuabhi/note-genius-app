
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserProgressState } from '@/hooks/useUserProgressState';

export interface StudySuggestion {
  id: string;
  type: 'schedule' | 'performance' | 'motivation' | 'focus' | 'onboarding';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  icon: '🎯' | '📚' | '⚡' | '🔥' | '📈' | '💪' | '🎉' | '🚀' | '✨' | '📝';
  subject?: string;
}

export const useStudySuggestions = (subjectAnalytics?: any, progressState?: UserProgressState) => {
  const { user } = useAuth();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['study-suggestions', user?.id, progressState?.userType, progressState?.totalItems],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🤖 Generating AI study suggestions for user type:', progressState?.userType);

      // Handle different user types
      if (!progressState || progressState.userType === 'new') {
        return generateNewUserSuggestions(progressState);
      }
      
      if (progressState.userType === 'intermediate') {
        return generateIntermediateUserSuggestions(progressState, user.id);
      }
      
      // Advanced users - use existing complex analytics if available
      if (!subjectAnalytics?.subjects) {
        return generateAdvancedFallbackSuggestions(progressState, user.id);
      }

      // Fetch study plans and recent sessions
      const [studyPlansResult, recentSessionsResult] = await Promise.all([
        supabase
          .from('study_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active'),
        
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('start_time', { ascending: false })
      ]);

      const studyPlans = studyPlansResult.data || [];
      const recentSessions = recentSessionsResult.data || [];
      const subjects = subjectAnalytics.subjects;

      const suggestions: StudySuggestion[] = [];

      // 1. Active Study Plans Analysis
      studyPlans.forEach((plan, index) => {
        const targetHoursPerWeek = plan.total_hours_per_week || 0;
        const targetSessionsPerWeek = Math.ceil(targetHoursPerWeek / (plan.preferred_session_duration / 60));
        
        const planSessions = recentSessions.filter(session => 
          session.study_plan_id === plan.id
        );
        
        const actualSessions = planSessions.length;
        const sessionsDifference = targetSessionsPerWeek - actualSessions;

        if (sessionsDifference > 0) {
          suggestions.push({
            id: `plan-behind-${index}`,
            type: 'schedule',
            priority: sessionsDifference >= 3 ? 'high' : 'medium',
            title: `Continue studying ${plan.title}`,
            description: `You're ${sessionsDifference} session${sessionsDifference > 1 ? 's' : ''} behind schedule this week`,
            actionable: true,
            icon: '🎯',
            subject: plan.subject
          });
        } else if (actualSessions >= targetSessionsPerWeek) {
          suggestions.push({
            id: `plan-progress-${index}`,
            type: 'motivation',
            priority: 'low',
            title: `Great progress on ${plan.title}`,
            description: 'You\'re meeting your study plan goals! Keep it up',
            actionable: false,
            icon: '🎉',
            subject: plan.subject
          });
        }
      });

      // 2. Subject Performance Analysis
      const lowPerformanceSubjects = subjects.filter(s => s.completionPercentage < 60);
      const highPerformanceSubjects = subjects.filter(s => s.completionPercentage >= 85);

      if (lowPerformanceSubjects.length > 0) {
        const worstSubject = lowPerformanceSubjects[0];
        suggestions.push({
          id: 'focus-weak-subject',
          type: 'focus',
          priority: 'high',
          title: `Focus on ${worstSubject.name}`,
          description: `Currently at ${worstSubject.completionPercentage}% completion - needs attention`,
          actionable: true,
          icon: '📚',
          subject: worstSubject.name
        });
      }

      if (highPerformanceSubjects.length > 0) {
        const bestSubject = highPerformanceSubjects[0];
        suggestions.push({
          id: 'maintain-strong-subject',
          type: 'motivation',
          priority: 'low',
          title: `Excellent work in ${bestSubject.name}`,
          description: `${bestSubject.completionPercentage}% completion - maintain this momentum with regular reviews`,
          actionable: false,
          icon: '💪',
          subject: bestSubject.name
        });
      }

      // 3. Study Pattern Analysis
      const todaysSessions = recentSessions.filter(session => {
        const sessionDate = new Date(session.start_time).toDateString();
        const today = new Date().toDateString();
        return sessionDate === today;
      });

      if (todaysSessions.length === 0 && new Date().getHours() > 10) {
        suggestions.push({
          id: 'start-today',
          type: 'schedule',
          priority: 'medium',
          title: 'Start your study session today',
          description: 'You haven\'t studied yet today. Even a short 15-minute session helps!',
          actionable: true,
          icon: '⚡'
        });
      }

      // 4. Consistency Patterns
      const last3Days = recentSessions.filter(session => {
        const sessionDate = new Date(session.start_time);
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        return sessionDate >= threeDaysAgo;
      });

      if (last3Days.length >= 3) {
        suggestions.push({
          id: 'streak-momentum',
          type: 'motivation',
          priority: 'low',
          title: 'You\'re on a study streak!',
          description: `${last3Days.length} sessions in the last 3 days. Keep the momentum going!`,
          actionable: false,
          icon: '🔥'
        });
      }

      // 5. Performance Improvement Suggestions
      const improvingSubjects = subjects.filter(s => 
        s.last7DaysTime > 0 && s.completionPercentage > 50 && s.completionPercentage < 85
      );

      if (improvingSubjects.length > 0) {
        const subject = improvingSubjects[0];
        suggestions.push({
          id: 'performance-boost',
          type: 'performance',
          priority: 'medium',
          title: `Boost your ${subject.name} performance`,
          description: 'You\'re making progress! Focus on quiz practice to improve retention',
          actionable: true,
          icon: '📈',
          subject: subject.name
        });
      }

      // Sort suggestions by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

      // Limit to top 4 suggestions
      return suggestions.slice(0, 4);
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  return {
    suggestions: suggestions || [],
    isLoading: isLoading || (progressState?.isLoading ?? true)
  };
};

// New user suggestions - no existing content
function generateNewUserSuggestions(progressState?: UserProgressState): StudySuggestion[] {
  return [
    {
      id: 'create-first-note',
      type: 'onboarding',
      priority: 'high',
      title: 'Create your first note',
      description: 'Start by adding study materials, lecture notes, or textbook content to organize your learning',
      actionable: true,
      icon: '📝'
    },
    {
      id: 'set-study-goal',
      type: 'onboarding',
      priority: 'high', 
      title: 'Set your first study goal',
      description: 'Define what you want to achieve this week to stay motivated and track progress',
      actionable: true,
      icon: '🎯'
    },
    {
      id: 'explore-features',
      type: 'motivation',
      priority: 'medium',
      title: 'Explore AI-powered features',
      description: 'Discover how PrepGenie can transform your notes into flashcards and quizzes automatically',
      actionable: true,
      icon: '✨'
    },
    {
      id: 'import-materials',
      type: 'onboarding',
      priority: 'medium',
      title: 'Import existing study materials',
      description: 'Upload PDFs, documents, or connect with Google Docs to get started quickly',
      actionable: true,
      icon: '📚'
    }
  ];
}

// Intermediate user suggestions - some content exists
async function generateIntermediateUserSuggestions(progressState: UserProgressState, userId: string): Promise<StudySuggestion[]> {
  const suggestions: StudySuggestion[] = [];
  
  // Content expansion suggestions
  if (progressState.hasNotes && !progressState.hasFlashcards) {
    suggestions.push({
      id: 'notes-to-flashcards',
      type: 'focus',
      priority: 'high',
      title: 'Transform notes into flashcards',
      description: 'Convert your existing notes into interactive flashcards for better memorization',
      actionable: true,
      icon: '🚀'
    });
  }
  
  if (progressState.hasNotes && !progressState.hasQuizzes) {
    suggestions.push({
      id: 'create-quiz',
      type: 'focus',
      priority: 'high',
      title: 'Test your knowledge with quizzes',
      description: 'Create quizzes from your notes to identify knowledge gaps and improve retention',
      actionable: true,
      icon: '🎯'
    });
  }
  
  if (!progressState.hasGoals) {
    suggestions.push({
      id: 'set-goals',
      type: 'motivation',
      priority: 'medium',
      title: 'Set study goals to stay on track',
      description: 'Define clear objectives to maintain motivation and measure your progress',
      actionable: true,
      icon: '📈'
    });
  }
  
  if (progressState.hasFlashcards || progressState.hasQuizzes) {
    suggestions.push({
      id: 'study-session',
      type: 'schedule',
      priority: 'medium',
      title: 'Start a focused study session',
      description: 'Review your flashcards or take a quiz to reinforce your learning',
      actionable: true,
      icon: '⚡'
    });
  }
  
  // Fallback motivation
  suggestions.push({
    id: 'progress-celebration',
    type: 'motivation',
    priority: 'low',
    title: 'Great progress so far!',
    description: `You've created ${progressState.totalItems} study items. Keep building your knowledge base!`,
    actionable: false,
    icon: '💪'
  });
  
  return suggestions.slice(0, 4);
}

// Advanced user fallback when analytics not available
async function generateAdvancedFallbackSuggestions(progressState: UserProgressState, userId: string): Promise<StudySuggestion[]> {
  const suggestions: StudySuggestion[] = [];
  
  // Check for recent activity
  const { data: recentSessions } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('start_time', { ascending: false });
  
  if (!recentSessions || recentSessions.length === 0) {
    suggestions.push({
      id: 'resume-studying',
      type: 'schedule',
      priority: 'high',
      title: 'Resume your study routine',
      description: 'You haven\'t studied today yet. Even a short session helps maintain momentum',
      actionable: true,
      icon: '⚡'
    });
  }
  
  suggestions.push({
    id: 'review-content',
    type: 'performance',
    priority: 'medium',
    title: 'Review your study materials',
    description: 'Go through your flashcards and notes to reinforce long-term retention',
    actionable: true,
    icon: '📚'
  });
  
  suggestions.push({
    id: 'optimize-studying',
    type: 'performance',
    priority: 'medium',
    title: 'Optimize your study approach',
    description: 'Analyze your performance data to identify the most effective study methods',
    actionable: true,
    icon: '📈'
  });
  
  suggestions.push({
    id: 'advanced-motivation',
    type: 'motivation',
    priority: 'low',
    title: 'You\'re doing amazing!',
    description: `With ${progressState.totalItems} study items, you're building a comprehensive knowledge base`,
    actionable: false,
    icon: '🎉'
  });
  
  return suggestions.slice(0, 4);
}


import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface StudySuggestion {
  id: string;
  type: 'schedule' | 'performance' | 'motivation' | 'focus';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  icon: '🎯' | '📚' | '⚡' | '🔥' | '📈' | '💪' | '🎉';
  actionUrl?: string;
  subject?: string;
}

export const useStudySuggestions = (subjectAnalytics?: any) => {
  const { user } = useAuth();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['study-suggestions', user?.id, subjectAnalytics?.subjects?.length],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      if (!subjectAnalytics?.subjects) return [];

      console.log('🤖 Generating AI study suggestions');

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
            actionUrl: '/study-sessions',
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
          actionUrl: '/flashcards',
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
          icon: '⚡',
          actionUrl: '/study-sessions'
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
          actionUrl: '/flashcards',
          subject: subject.name
        });
      }

      // Sort suggestions by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

      // Limit to top 4 suggestions
      return suggestions.slice(0, 4);
    },
    enabled: !!user && !!subjectAnalytics?.subjects,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  return {
    suggestions: suggestions || [],
    isLoading: isLoading || !subjectAnalytics?.subjects
  };
};

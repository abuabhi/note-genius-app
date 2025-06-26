
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { LearningInsight } from '@/types/advancedAnalytics';

export const useLearningInsights = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query existing insights
  const { data: insights, isLoading } = useQuery({
    queryKey: ['learning-insights', user?.id],
    queryFn: async (): Promise<LearningInsight[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('learning_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false });

      if (error) throw error;

      return (data || []).map(insight => ({
        id: insight.id,
        type: insight.insight_type as any,
        title: insight.insight_data?.title || '',
        description: insight.insight_data?.description || '',
        confidence: insight.confidence_score,
        actionable: insight.insight_data?.actionable || false,
        priority: insight.insight_data?.priority || 'medium',
        expiresAt: insight.expires_at
      }));
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Generate new insights
  const generateInsights = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('💡 Generating learning insights...');

      // Get comprehensive user data
      const [sessionsData, progressData, goalsData, patternsData] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(50),
        
        supabase
          .from('user_flashcard_progress')
          .select('*, flashcards!inner(flashcard_sets!inner(subject))')
          .eq('user_id', user.id),
        
        supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active'),
        
        supabase
          .from('learning_patterns')
          .select('*')
          .eq('user_id', user.id)
          .order('strength_score', { ascending: false })
      ]);

      const sessions = sessionsData.data || [];
      const progress = progressData.data || [];
      const goals = goalsData.data || [];
      const patterns = patternsData.data || [];

      const newInsights: Omit<LearningInsight, 'id'>[] = [];

      // Weekly goal progress insights
      if (goals.length > 0) {
        const currentWeekHours = sessions
          .filter(s => new Date(s.start_time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((acc, s) => acc + (s.duration || 0), 0) / 3600;
        
        const weeklyGoal = goals[0].target_hours || 5;
        const progress_pct = (currentWeekHours / weeklyGoal) * 100;

        if (progress_pct < 50) {
          newInsights.push({
            type: 'warning',
            title: 'Weekly Goal Behind Schedule',
            description: `You're at ${Math.round(progress_pct)}% of your weekly goal. Consider scheduling additional study time.`,
            confidence: 0.9,
            actionable: true,
            priority: 'high',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        } else if (progress_pct > 120) {
          newInsights.push({
            type: 'achievement',
            title: 'Exceeding Weekly Goal!',
            description: `You've completed ${Math.round(progress_pct)}% of your weekly goal. Great consistency!`,
            confidence: 1.0,
            actionable: false,
            priority: 'medium',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Learning velocity insights
      const recentSessions = sessions.slice(0, 20);
      const cardsPerHour = recentSessions.length > 0 
        ? recentSessions.reduce((acc, s) => acc + (s.cards_reviewed || 0), 0) / 
          Math.max(recentSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600, 1)
        : 0;

      if (cardsPerHour > 0) {
        if (cardsPerHour > 50) {
          newInsights.push({
            type: 'recommendation',
            title: 'Consider Slowing Down',
            description: `You're reviewing ${Math.round(cardsPerHour)} cards/hour. Slower review might improve retention.`,
            confidence: 0.7,
            actionable: true,
            priority: 'medium',
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          });
        } else if (cardsPerHour < 15) {
          newInsights.push({
            type: 'recommendation',
            title: 'Try to Increase Pace',
            description: `At ${Math.round(cardsPerHour)} cards/hour, you might benefit from slightly faster review.`,
            confidence: 0.6,
            actionable: true,
            priority: 'low',
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Retention insights
      const overdueCards = progress.filter(p => {
        if (!p.next_review_at) return false;
        return new Date(p.next_review_at) < new Date();
      });

      if (overdueCards.length > 10) {
        newInsights.push({
          type: 'warning',
          title: 'Cards Need Review',
          description: `${overdueCards.length} cards are overdue for review. Regular review improves retention.`,
          confidence: 0.95,
          actionable: true,
          priority: 'high',
          expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Pattern-based insights
      const studyTimePattern = patterns.find(p => p.pattern_type === 'study_time');
      if (studyTimePattern && studyTimePattern.strength_score > 0.7) {
        const peakHours = studyTimePattern.pattern_data?.peakHours || [];
        newInsights.push({
          type: 'recommendation',
          title: 'Optimize Study Schedule',
          description: `Your peak performance hours are ${peakHours.map((h: number) => `${h}:00`).join(', ')}. Schedule important topics during these times.`,
          confidence: studyTimePattern.strength_score,
          actionable: true,
          priority: 'medium',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Subject mastery insights
      const subjectProgress = progress.reduce((acc, p) => {
        const subject = p.flashcards?.flashcard_sets?.subject || 'General';
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(p.mastery_level);
        return acc;
      }, {} as Record<string, number[]>);

      Object.entries(subjectProgress).forEach(([subject, levels]) => {
        const avgMastery = levels.reduce((a, b) => a + b, 0) / levels.length;
        if (avgMastery >= 4) {
          newInsights.push({
            type: 'achievement',
            title: `${subject} Mastery Achieved`,
            description: `You've achieved high mastery in ${subject}. Consider advancing to more challenging topics.`,
            confidence: 0.9,
            actionable: true,
            priority: 'medium',
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          });
        } else if (avgMastery < 2) {
          newInsights.push({
            type: 'recommendation',
            title: `Focus on ${subject}`,
            description: `${subject} needs more attention. Consider dedicating extra study time to this subject.`,
            confidence: 0.8,
            actionable: true,
            priority: 'high',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });

      // Save insights
      const insightInserts = newInsights.map(insight => ({
        user_id: user.id,
        insight_type: insight.type,
        insight_data: {
          title: insight.title,
          description: insight.description,
          actionable: insight.actionable,
          priority: insight.priority
        },
        confidence_score: insight.confidence,
        expires_at: insight.expiresAt
      }));

      if (insightInserts.length > 0) {
        const { error } = await supabase
          .from('learning_insights')
          .insert(insightInserts);

        if (error) throw error;
      }

      console.log('✅ Generated learning insights:', newInsights.length);
      return newInsights;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-insights', user?.id] });
    }
  });

  // Dismiss insight
  const dismissInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('learning_insights')
        .update({ is_active: false })
        .eq('id', insightId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-insights', user?.id] });
    }
  });

  return {
    insights: insights || [],
    generateInsights: generateInsights.mutate,
    dismissInsight: dismissInsight.mutate,
    isGenerating: generateInsights.isPending,
    isLoading
  };
};

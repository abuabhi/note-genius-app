
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { LearningInsight } from '@/types/advancedAnalytics';

export const useLearningInsights = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // Query existing insights
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['learning-insights', user?.id],
    queryFn: async (): Promise<LearningInsight[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('learning_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('generated_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => {
        const insightData = item.insight_data as any;
        return {
          id: item.id,
          type: item.insight_type as LearningInsight['type'],
          title: insightData?.title || 'Learning Insight',
          description: insightData?.description || 'No description available',
          confidence: item.confidence_score || 0.8,
          actionable: insightData?.actionable || false,
          priority: insightData?.priority || 'medium',
          expiresAt: item.expires_at || new Date().toISOString()
        };
      });
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation to generate insights
  const generateInsightsMutation = useMutation({
    mutationFn: async (): Promise<Omit<LearningInsight, 'id'>[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      setIsGenerating(true);
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
          .select('*')
          .eq('user_id', user.id)
          .limit(100),
        
        supabase
          .from('study_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active'),
        
        supabase
          .from('learning_patterns')
          .select('*')
          .eq('user_id', user.id)
      ]);

      const sessions = sessionsData.data || [];
      const progress = progressData.data || [];
      const goals = goalsData.data || [];
      const patterns = patternsData.data || [];

      const newInsights: Omit<LearningInsight, 'id'>[] = [];

      // Performance trend insight
      const recentSessions = sessions.slice(0, 10);
      const olderSessions = sessions.slice(10, 20);
      
      if (recentSessions.length > 0 && olderSessions.length > 0) {
        const recentAvg = recentSessions.reduce((acc, s) => 
          acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / recentSessions.length;
        const olderAvg = olderSessions.reduce((acc, s) => 
          acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / olderSessions.length;
        
        const improvement = recentAvg - olderAvg;
        
        if (improvement > 0.1) {
          newInsights.push({
            type: 'achievement',
            title: 'Great Progress!',
            description: `Your accuracy has improved by ${Math.round(improvement * 100)}% in recent sessions. Keep up the excellent work!`,
            confidence: 0.9,
            actionable: false,
            priority: 'high',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          });
        } else if (improvement < -0.1) {
          newInsights.push({
            type: 'warning',
            title: 'Performance Dip Detected',
            description: `Your accuracy has decreased by ${Math.round(Math.abs(improvement) * 100)}%. Consider taking a break or reviewing difficult topics.`,
            confidence: 0.8,
            actionable: true,
            priority: 'high',
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Study consistency insight
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentSessionsCount = sessions.filter(s => new Date(s.start_time) > last7Days).length;
      
      if (recentSessionsCount === 0) {
        newInsights.push({
          type: 'recommendation',
          title: 'Time to Get Back on Track',
          description: 'You haven\'t studied in the past week. Start with a short 15-minute session to rebuild your momentum.',
          confidence: 1.0,
          actionable: true,
          priority: 'high',
          expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        });
      } else if (recentSessionsCount >= 5) {
        newInsights.push({
          type: 'achievement',
          title: 'Consistent Learner!',
          description: `You've studied ${recentSessionsCount} times this week. Your consistency is paying off!`,
          confidence: 1.0,
          actionable: false,
          priority: 'medium',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Subject mastery insights
      const subjectProgress = progress.reduce((acc, p) => {
        const subject = 'General'; // Default subject
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(p.mastery_level);
        return acc;
      }, {} as Record<string, number[]>);

      Object.entries(subjectProgress).forEach(([subject, levels]) => {
        const avgMastery = levels.reduce((a, b) => a + b, 0) / levels.length;
        
        if (avgMastery >= 4) {
          newInsights.push({
            type: 'achievement',
            title: `${subject} Mastery Achieved!`,
            description: `You've achieved excellent mastery in ${subject} with an average level of ${avgMastery.toFixed(1)}.`,
            confidence: 0.9,
            actionable: false,
            priority: 'medium',
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          });
        } else if (avgMastery < 2) {
          newInsights.push({
            type: 'recommendation',
            title: `Focus on ${subject}`,
            description: `Your ${subject} mastery is below average. Consider spending more time on this subject.`,
            confidence: 0.8,
            actionable: true,
            priority: 'medium',
            expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
          });
        }
      });

      // Pattern-based insights
      const studyTimePattern = patterns.find(p => p.pattern_type === 'study_time');
      if (studyTimePattern) {
        const patternData = studyTimePattern.pattern_data as any;
        const peakHours = patternData?.peakHours;
        if (Array.isArray(peakHours) && peakHours.length > 0) {
          newInsights.push({
            type: 'recommendation',
            title: 'Optimize Your Study Schedule',
            description: `Your peak performance hours are ${peakHours.join(', ')}:00. Schedule challenging topics during these times.`,
            confidence: 0.8,
            actionable: true,
            priority: 'medium',
            expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
          });
        }
      }

      // Store insights in database
      if (newInsights.length > 0) {
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

        await supabase
          .from('learning_insights')
          .insert(insightInserts);
      }

      console.log('✅ Learning insights generated:', newInsights.length);
      return newInsights;
    },
    onSuccess: () => {
      setIsGenerating(false);
    },
    onError: (error) => {
      console.error('Error generating insights:', error);
      setIsGenerating(false);
    }
  });

  // Function to dismiss an insight
  const dismissInsight = async (insightId: string) => {
    await supabase
      .from('learning_insights')
      .update({ is_active: false })
      .eq('id', insightId)
      .eq('user_id', user?.id);
  };

  return {
    insights,
    generateInsights: generateInsightsMutation.mutate,
    dismissInsight,
    isGenerating,
    isLoading
  };
};

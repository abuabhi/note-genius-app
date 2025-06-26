
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { BehavioralPattern } from '@/types/advancedAnalytics';

export const useBehavioralAnalysis = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Query existing patterns
  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['behavioral-patterns', user?.id],
    queryFn: async (): Promise<BehavioralPattern[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('learning_patterns')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        type: item.pattern_type as BehavioralPattern['type'],
        pattern: item.pattern_data as any,
        strength: item.strength_score || 0.5,
        detectedAt: item.detected_at || new Date().toISOString(),
        recommendations: Array.isArray((item.pattern_data as any)?.recommendations) 
          ? (item.pattern_data as any).recommendations 
          : []
      }));
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Mutation to analyze patterns
  const analyzePatternsMutation = useMutation({
    mutationFn: async (): Promise<Omit<BehavioralPattern, 'id'>[]> => {
      if (!user?.id) throw new Error('User not authenticated');
      
      setIsAnalyzing(true);
      console.log('🧠 Analyzing behavioral patterns...');

      // Get user's study data
      const [sessionsData, progressData] = await Promise.all([
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(100),
        
        supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .limit(200)
      ]);

      const sessions = sessionsData.data || [];
      const progress = progressData.data || [];

      const newPatterns: Omit<BehavioralPattern, 'id'>[] = [];

      // Analyze study time patterns
      const sessionsByHour = sessions.reduce((acc, session) => {
        const hour = new Date(session.start_time).getHours();
        if (!acc[hour]) acc[hour] = [];
        acc[hour].push(session);
        return acc;
      }, {} as Record<number, any[]>);

      const peakHours = Object.entries(sessionsByHour)
        .filter(([_, sessions]) => sessions.length > 2)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      if (peakHours.length > 0) {
        newPatterns.push({
          type: 'study_time',
          pattern: { peakHours },
          strength: Math.min(0.9, peakHours.length / 3),
          detectedAt: new Date().toISOString(),
          recommendations: [
            `Your peak study hours are ${peakHours.join(', ')}:00. Schedule important sessions during these times.`,
            'Consider blocking these time slots for focused study sessions.'
          ]
        });
      }

      // Analyze break frequency patterns
      const avgSessionDuration = sessions.length > 0 
        ? sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / sessions.length 
        : 0;

      if (avgSessionDuration > 0) {
        const recommendedBreakInterval = avgSessionDuration > 3600 ? 15 : 10; // minutes
        newPatterns.push({
          type: 'break_frequency',
          pattern: { 
            averageSessionDuration: avgSessionDuration,
            recommendedBreakInterval 
          },
          strength: 0.7,
          detectedAt: new Date().toISOString(),
          recommendations: [
            `Take a ${recommendedBreakInterval}-minute break every ${Math.round(avgSessionDuration / 60)} minutes.`,
            'Use the Pomodoro technique to maintain focus and prevent burnout.'
          ]
        });
      }

      // Analyze learning style patterns
      const totalAccuracy = sessions.length > 0 
        ? sessions.reduce((acc, s) => acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / sessions.length
        : 0;
      
      const avgPace = sessions.length > 0 
        ? sessions.reduce((acc, s) => acc + ((s.cards_reviewed || 0) / Math.max((s.duration || 0) / 60, 1)), 0) / sessions.length
        : 0;

      if (sessions.length > 5) {
        const style = avgPace > 2 ? 'fast_paced' : avgPace > 1 ? 'moderate_paced' : 'deliberate_paced';
        newPatterns.push({
          type: 'learning_style',
          pattern: { 
            style,
            averageAccuracy: totalAccuracy,
            averagePace: avgPace
          },
          strength: 0.8,
          detectedAt: new Date().toISOString(),
          recommendations: [
            `Your ${style.replace('_', ' ')} learning style shows ${Math.round(totalAccuracy * 100)}% accuracy.`,
            style === 'fast_paced' 
              ? 'Consider slowing down for complex topics to improve retention.'
              : 'Your deliberate approach is great for deep learning.'
          ]
        });
      }

      // Store patterns in database
      if (newPatterns.length > 0) {
        const patternInserts = newPatterns.map(pattern => ({
          user_id: user.id,
          pattern_type: pattern.type,
          pattern_data: { ...pattern.pattern, recommendations: pattern.recommendations },
          strength_score: pattern.strength,
          detected_at: pattern.detectedAt
        }));

        await supabase
          .from('learning_patterns')
          .upsert(patternInserts, { 
            onConflict: 'user_id,pattern_type',
            ignoreDuplicates: false 
          });
      }

      console.log('✅ Behavioral patterns analyzed:', newPatterns.length);
      return newPatterns;
    },
    onSuccess: () => {
      setIsAnalyzing(false);
    },
    onError: (error) => {
      console.error('Error analyzing patterns:', error);
      setIsAnalyzing(false);
    }
  });

  return {
    patterns,
    analyzePatterns: analyzePatternsMutation.mutate,
    isAnalyzing,
    isLoading
  };
};

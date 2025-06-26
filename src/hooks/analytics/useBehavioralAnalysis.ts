
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { BehavioralPattern } from '@/types/advancedAnalytics';

export const useBehavioralAnalysis = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query existing patterns
  const { data: patterns, isLoading } = useQuery({
    queryKey: ['behavioral-patterns', user?.id],
    queryFn: async (): Promise<BehavioralPattern[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('learning_patterns')
        .select('*')
        .eq('user_id', user.id)
        .order('strength_score', { ascending: false });

      if (error) throw error;

      return (data || []).map(pattern => ({
        id: pattern.id,
        type: pattern.pattern_type as any,
        pattern: pattern.pattern_data,
        strength: pattern.strength_score,
        detectedAt: pattern.detected_at,
        recommendations: pattern.pattern_data?.recommendations || []
      }));
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Analyze and detect new patterns
  const analyzePatterns = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🔍 Analyzing behavioral patterns...');

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
          .order('last_reviewed_at', { ascending: false })
          .limit(200)
      ]);

      const sessions = sessionsData.data || [];
      const progress = progressData.data || [];

      const detectedPatterns: Omit<BehavioralPattern, 'id'>[] = [];

      // Analyze study time patterns
      const studyHours = sessions.map(s => new Date(s.start_time).getHours());
      const hourCounts = studyHours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const peakHours = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      if (peakHours.length > 0) {
        detectedPatterns.push({
          type: 'study_time',
          pattern: { 
            peakHours, 
            totalSessions: sessions.length,
            distribution: hourCounts 
          },
          strength: Math.min(1, sessions.length / 20), // Stronger with more data
          detectedAt: new Date().toISOString(),
          recommendations: [
            `Your most productive study hours are ${peakHours.map(h => `${h}:00`).join(', ')}`,
            'Schedule important study sessions during your peak hours',
            'Avoid challenging topics during your low-energy times'
          ]
        });
      }

      // Analyze break frequency patterns
      const sessionDurations = sessions.map(s => s.duration || 0).filter(d => d > 0);
      if (sessionDurations.length > 5) {
        const avgDuration = sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length;
        const optimalBreakTime = avgDuration < 1800 ? 5 : avgDuration < 3600 ? 10 : 15;
        
        detectedPatterns.push({
          type: 'break_frequency',
          pattern: { 
            averageSessionDuration: avgDuration,
            recommendedBreakInterval: optimalBreakTime,
            sessionCount: sessionDurations.length
          },
          strength: Math.min(1, sessionDurations.length / 15),
          detectedAt: new Date().toISOString(),
          recommendations: [
            `Take ${optimalBreakTime}-minute breaks based on your ${Math.round(avgDuration/60)}-minute average sessions`,
            'Use the Pomodoro technique for better focus',
            'Stand up and stretch during breaks'
          ]
        });
      }

      // Analyze learning style indicators
      const cardAccuracies = sessions.map(s => ({
        accuracy: (s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1),
        cardsPerMinute: (s.cards_reviewed || 0) / Math.max((s.duration || 0) / 60, 1)
      })).filter(s => s.accuracy > 0);

      if (cardAccuracies.length > 10) {
        const avgAccuracy = cardAccuracies.reduce((acc, s) => acc + s.accuracy, 0) / cardAccuracies.length;
        const avgPace = cardAccuracies.reduce((acc, s) => acc + s.cardsPerMinute, 0) / cardAccuracies.length;
        
        let learningStyle = 'balanced';
        if (avgPace > 1.5 && avgAccuracy > 0.8) learningStyle = 'fast_accurate';
        else if (avgPace < 0.8 && avgAccuracy > 0.8) learningStyle = 'careful_methodical';
        else if (avgPace > 1.2 && avgAccuracy < 0.7) learningStyle = 'fast_exploratory';

        detectedPatterns.push({
          type: 'learning_style',
          pattern: { 
            style: learningStyle,
            averageAccuracy: avgAccuracy,
            averagePace: avgPace,
            sampleSize: cardAccuracies.length
          },
          strength: Math.min(1, cardAccuracies.length / 20),
          detectedAt: new Date().toISOString(),
          recommendations: {
            fast_accurate: [
              'You learn quickly with high accuracy - try more challenging content',
              'Consider teaching others to reinforce your learning',
              'Set progressive difficulty goals'
            ],
            careful_methodical: [
              'You prefer thorough understanding - take your time with complex topics',
              'Use detailed notes and explanations',
              'Focus on fewer topics but master them deeply'
            ],
            fast_exploratory: [
              'You like to explore quickly - slow down for better retention',
              'Review cards multiple times before moving on',
              'Use spaced repetition more consistently'
            ],
            balanced: [
              'You have a balanced learning approach',
              'Experiment with different techniques to optimize further',
              'Track which methods work best for different subjects'
            ]
          }[learningStyle] || []
        });
      }

      // Analyze attention span patterns
      const longSessions = sessions.filter(s => (s.duration || 0) > 1800); // > 30 minutes
      if (longSessions.length > 5) {
        const avgLongSessionDuration = longSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / longSessions.length;
        const attentionSpan = Math.round(avgLongSessionDuration / 60); // minutes
        
        detectedPatterns.push({
          type: 'attention_span',
          pattern: { 
            averageAttentionSpan: attentionSpan,
            longSessionCount: longSessions.length,
            totalSessions: sessions.length
          },
          strength: Math.min(1, longSessions.length / 10),
          detectedAt: new Date().toISOString(),
          recommendations: [
            `Your attention span is approximately ${attentionSpan} minutes`,
            'Plan study blocks that match your natural attention span',
            'Use timers to maintain focus awareness'
          ]
        });
      }

      // Save detected patterns
      const patternInserts = detectedPatterns.map(pattern => ({
        user_id: user.id,
        pattern_type: pattern.type,
        pattern_data: pattern.pattern,
        strength_score: pattern.strength,
        detected_at: pattern.detectedAt
      }));

      if (patternInserts.length > 0) {
        // Clear old patterns of the same types
        const patternTypes = patternInserts.map(p => p.pattern_type);
        await supabase
          .from('learning_patterns')
          .delete()
          .eq('user_id', user.id)
          .in('pattern_type', patternTypes);

        // Insert new patterns
        const { error } = await supabase
          .from('learning_patterns')
          .insert(patternInserts);

        if (error) throw error;
      }

      console.log('✅ Behavioral patterns analyzed:', detectedPatterns.length);
      return detectedPatterns;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavioral-patterns', user?.id] });
    }
  });

  return {
    patterns: patterns || [],
    analyzePatterns: analyzePatterns.mutate,
    isAnalyzing: analyzePatterns.isPending,
    isLoading
  };
};

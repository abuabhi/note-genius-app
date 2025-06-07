
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { subMonths, format } from 'date-fns';
import { AdaptiveLearningInsights, StudyPreferences } from './types';
import { generateRealAdaptiveLearningPath, analyzeRealStudyPatterns } from './realAdaptiveLearningCalculations';
import { generateRealOptimalSchedule } from './realScheduleOptimization';

export const useAdaptiveLearning = (preferences?: Partial<StudyPreferences>) => {
  const { user } = useAuth();

  const { data: adaptiveLearningInsights, isLoading } = useQuery({
    queryKey: ['adaptive-learning-real', user?.id, preferences],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('🔄 Fetching real adaptive learning data for user:', user.id);

      // Get extended historical data
      const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
      
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', `${threeMonthsAgo}T00:00:00Z`)
        .not('duration', 'is', null)
        .order('start_time', { ascending: false });

      const { data: flashcardSets } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: userProgress } = await supabase
        .from('user_flashcard_progress')
        .select(`
          *,
          flashcard (
            *,
            flashcard_set_cards (
              set_id,
              flashcard_sets (
                id,
                name,
                subject
              )
            )
          )
        `)
        .eq('user_id', user.id);

      const userSessions = sessions || [];
      const sets = flashcardSets || [];
      const progress = userProgress || [];

      console.log('📊 Processing data:', {
        sessions: userSessions.length,
        sets: sets.length,
        progress: progress.length
      });

      // Generate real learning paths
      const learningPaths = generateRealAdaptiveLearningPath(userSessions, sets, progress);

      // Generate real study schedule
      const studySchedule = generateRealOptimalSchedule(userSessions, sets);

      // Analyze real behavioral patterns
      const behavioralPatterns = analyzeRealStudyPatterns(userSessions);

      // Generate performance forecast (simplified for now)
      const performanceForecast = {
        subjectForecasts: sets.map(set => ({
          subject: set.subject || set.name,
          currentMastery: calculateSetMastery(progress, set.id),
          projectedMastery: Math.min(100, calculateSetMastery(progress, set.id) + 15),
          projectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          confidenceInterval: { lower: 60, upper: 90 },
          factors: ['Recent study activity', 'Current progress rate']
        })),
        overallTrend: 'improving' as const,
        examReadiness: [],
        riskAreas: [],
        recommendedActions: []
      };

      // Generate optimization suggestions
      const optimizationSuggestions = [
        {
          category: 'schedule' as const,
          suggestion: 'Study during your peak performance hours',
          rationale: `Your efficiency is highest during ${studySchedule.optimizedTimes[0]?.startTime || 'morning hours'}`,
          expectedBenefit: 'Up to 20% improvement in retention',
          implementationDifficulty: 'easy' as const,
          priority: 1
        },
        {
          category: 'technique' as const,
          suggestion: 'Use spaced repetition for better retention',
          rationale: 'Your study patterns show room for optimization',
          expectedBenefit: 'Improved long-term memory retention',
          implementationDifficulty: 'moderate' as const,
          priority: 2
        }
      ];

      console.log('✅ Generated insights:', {
        learningPaths: learningPaths.length,
        optimalTimes: studySchedule.optimizedTimes.length,
        patterns: behavioralPatterns.length
      });

      return {
        learningPaths,
        studySchedule,
        performanceForecast,
        behavioralPatterns,
        optimizationSuggestions
      } as AdaptiveLearningInsights;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  return {
    adaptiveLearningInsights: adaptiveLearningInsights || getDefaultInsights(user?.id || ''),
    isLoading
  };
};

function calculateSetMastery(progress: any[], setId: string): number {
  const setProgress = progress.filter(p => 
    p.flashcard?.flashcard_set_cards?.[0]?.set_id === setId
  );
  
  if (setProgress.length === 0) return 0;
  
  return setProgress.reduce((sum, p) => sum + (p.mastery_level || 0), 0) / setProgress.length;
}

function getDefaultInsights(userId: string): AdaptiveLearningInsights {
  return {
    learningPaths: [],
    studySchedule: {
      userId,
      weeklyPattern: [],
      optimizedTimes: [],
      adaptiveBreaks: [],
      preferences: {
        preferredStudyDuration: 45,
        maxDailyStudyTime: 180,
        preferredDifficulty: 'adaptive',
        breakFrequency: 'moderate',
        studyStyle: 'distributed'
      },
      lastUpdated: new Date().toISOString()
    },
    performanceForecast: {
      subjectForecasts: [],
      overallTrend: 'stable',
      examReadiness: [],
      riskAreas: [],
      recommendedActions: []
    },
    behavioralPatterns: [],
    optimizationSuggestions: []
  };
}

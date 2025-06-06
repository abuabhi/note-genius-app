
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useProgressAnalytics } from "../useProgressAnalytics";
import { subMonths, format } from 'date-fns';
import { AdaptiveLearningInsights, StudyPreferences } from './types';
import { generateAdaptiveLearningPath, analyzeStudyPatterns } from './adaptiveLearningCalculations';
import { generateOptimalSchedule } from './scheduleOptimization';
import { generatePerformanceForecast } from './performanceForecasting';

export const useAdaptiveLearning = (preferences?: Partial<StudyPreferences>) => {
  const { user } = useAuth();
  const { gradeProgression } = useProgressAnalytics();

  const { data: adaptiveLearningInsights, isLoading } = useQuery({
    queryKey: ['adaptive-learning', user?.id, preferences],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Get extended historical data for comprehensive analysis
      const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
      
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', `${threeMonthsAgo}T00:00:00Z`)
        .not('duration', 'is', null);

      const userSessions = sessions || [];

      // Convert gradeProgression to FlashcardProgress format
      const flashcardProgress = gradeProgression.map(gp => ({
        ...gp,
        grade: 'C', // Default grade since GradeProgression doesn't have this field
        mastery_level: gp.masteryLevel || 0
      }));

      // Generate adaptive learning paths for different subjects based on flashcard sets
      const subjectSets = [...new Set(userSessions.map(s => s.flashcard_set_id).filter(Boolean))];
      const learningPaths = subjectSets.length > 0 
        ? subjectSets.map(setId => generateAdaptiveLearningPath(userSessions, flashcardProgress, `Set ${setId}`))
        : [];

      // Generate optimal study schedule
      const studySchedule = generateOptimalSchedule(userSessions, preferences);

      // Generate performance forecast
      const performanceForecast = generatePerformanceForecast(userSessions, flashcardProgress);

      // Analyze behavioral patterns
      const behavioralPatterns = analyzeStudyPatterns(userSessions);

      // Generate optimization suggestions
      const optimizationSuggestions = [
        {
          category: 'schedule' as const,
          suggestion: 'Consider studying during your peak performance hours',
          rationale: 'Data shows higher accuracy during certain time periods',
          expectedBenefit: 'Up to 15% improvement in retention',
          implementationDifficulty: 'easy' as const,
          priority: 1
        },
        {
          category: 'technique' as const,
          suggestion: 'Implement spaced repetition for weak subjects',
          rationale: 'Adaptive algorithms show better long-term retention',
          expectedBenefit: 'Improved mastery scores',
          implementationDifficulty: 'moderate' as const,
          priority: 2
        }
      ];

      return {
        learningPaths,
        studySchedule,
        performanceForecast,
        behavioralPatterns,
        optimizationSuggestions
      } as AdaptiveLearningInsights;
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    adaptiveLearningInsights: adaptiveLearningInsights || {
      learningPaths: [],
      studySchedule: {
        userId: user?.id || '',
        weeklyPattern: [],
        optimizedTimes: [],
        adaptiveBreaks: [],
        preferences: {
          preferredStudyDuration: 45,
          maxDailyStudyTime: 180,
          preferredDifficulty: 'adaptive' as const,
          breakFrequency: 'moderate' as const,
          studyStyle: 'distributed' as const
        },
        lastUpdated: new Date().toISOString()
      },
      performanceForecast: {
        subjectForecasts: [],
        overallTrend: 'stable' as const,
        examReadiness: [],
        riskAreas: [],
        recommendedActions: []
      },
      behavioralPatterns: [],
      optimizationSuggestions: []
    },
    isLoading
  };
};

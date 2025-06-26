
import { usePredictiveLearning } from './usePredictiveLearning';
import { useAdvancedPerformanceMetrics } from './useAdvancedPerformanceMetrics';
import { useBehavioralAnalysis } from './useBehavioralAnalysis';
import { useLearningInsights } from './useLearningInsights';
import { useComparativeBenchmarks } from './useComparativeBenchmarks';
import { AdvancedAnalyticsData } from '@/types/advancedAnalytics';

export const useAdvancedAnalytics = () => {
  const { predictions, calculatePredictions, isCalculating: isPredicting } = usePredictiveLearning();
  const { metrics } = useAdvancedPerformanceMetrics();
  const { patterns, analyzePatterns, isAnalyzing } = useBehavioralAnalysis();
  const { insights, generateInsights, dismissInsight, isGenerating } = useLearningInsights();
  const { benchmarks } = useComparativeBenchmarks();

  const isLoading = isPredicting || isAnalyzing || isGenerating;

  const analyticsData: AdvancedAnalyticsData | null = predictions && metrics ? {
    predictiveLearning: predictions,
    performanceMetrics: metrics,
    behavioralPatterns: patterns,
    insights: insights,
    comparativeBenchmarks: benchmarks,
    lastUpdated: new Date().toISOString()
  } : null;

  const refreshAllAnalytics = async () => {
    console.log('🔄 Refreshing all advanced analytics...');
    try {
      await Promise.all([
        calculatePredictions(),
        analyzePatterns(),
        generateInsights()
      ]);
      console.log('✅ All analytics refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing analytics:', error);
      throw error;
    }
  };

  return {
    data: analyticsData,
    predictions,
    metrics,
    patterns,
    insights,
    benchmarks,
    refreshAllAnalytics,
    dismissInsight,
    isLoading,
    isCalculating: isPredicting,
    isAnalyzing,
    isGenerating
  };
};

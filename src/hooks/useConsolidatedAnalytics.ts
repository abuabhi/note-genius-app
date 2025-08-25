
import { useAnalytics } from '@/contexts/AnalyticsContext';

export const useConsolidatedAnalytics = () => {
  const { analytics, isLoading } = useAnalytics();

  return { 
    analytics, 
    isLoading 
  };
};

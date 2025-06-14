
import { useSimpleAnalytics } from './useSimpleAnalytics';

export const useConsolidatedAnalytics = () => {
  const { analytics, isLoading } = useSimpleAnalytics();

  return { 
    analytics, 
    isLoading 
  };
};

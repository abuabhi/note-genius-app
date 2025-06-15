
import { useUltraSimpleAnalytics } from './useUltraSimpleAnalytics';

export const useConsolidatedAnalytics = () => {
  const { analytics, isLoading } = useUltraSimpleAnalytics();

  return { 
    analytics, 
    isLoading 
  };
};

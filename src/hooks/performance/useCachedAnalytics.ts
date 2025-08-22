
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useCacheStrategy } from './useCacheStrategy';

interface AnalyticsData {
  totalStudyTime: number;
  sessionsThisWeek: number;
  averageScore: number;
  streakDays: number;
  cardsReviewed: number;
  lastUpdated: string;
}

export const useCachedAnalytics = () => {
  const { user } = useAuth();
  const { staleWhileRevalidate, cacheConfigs } = useCacheStrategy();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['cached-analytics', user?.id],
    queryFn: async (): Promise<AnalyticsData | null> => {
      if (!user) return null;
      
      // Removed console log for production performance
      
      // Simulate API call - replace with actual analytics fetching
      const mockAnalytics: AnalyticsData = {
        totalStudyTime: 120,
        sessionsThisWeek: 5,
        averageScore: 85,
        streakDays: 7,
        cardsReviewed: 150,
        lastUpdated: new Date().toISOString()
      };
      
      return mockAnalytics;
    },
    enabled: !!user,
    ...cacheConfigs.user,
    // Prevent unnecessary refetches on focus changes
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable automatic polling
  });

  // Prefetch related data
  const prefetchRelatedData = async () => {
    if (!user) return;
    
    await staleWhileRevalidate(
      ['user-progress', user.id],
      async () => {
        // Mock progress data
        return {
          completedGoals: 3,
          activeGoals: 2,
          achievements: 8
        };
      }
    );
  };

  return {
    analytics,
    isLoading,
    error,
    prefetchRelatedData
  };
};

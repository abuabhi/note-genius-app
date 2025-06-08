
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useCacheStrategy } from './useCacheStrategy';

export const useCachedAnalytics = () => {
  const { user } = useAuth();
  const { staleWhileRevalidate, cacheConfigs } = useCacheStrategy();

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['cached-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('📊 Fetching analytics data...');
      
      // Simulate API call - replace with actual analytics fetching
      const mockAnalytics = {
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
    // Use stale-while-revalidate for analytics
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
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

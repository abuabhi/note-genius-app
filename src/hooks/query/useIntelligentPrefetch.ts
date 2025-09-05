import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useManagedInterval } from '@/utils/performance';

interface NavigationPattern {
  from: string;
  to: string;
  count: number;
  lastAccess: number;
}

type PrefetchPriority = 'high' | 'medium' | 'low';

interface PrefetchRule {
  routePattern: RegExp;
  prefetchQueries: (params: Record<string, any>) => Array<{
    queryKey: readonly unknown[];
    staleTime?: number;
  }>;
  priority: PrefetchPriority;
}

export const useIntelligentPrefetch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Track navigation patterns
  const navigationHistory = useRef<NavigationPattern[]>([]);
  const previousLocation = useRef<string>('');
  const sessionStartTime = useRef<number>(Date.now());

  // Prefetch rules based on common user patterns
  const prefetchRules = useRef<PrefetchRule[]>([
    {
      routePattern: /^\/dashboard/,
      priority: 'high' as PrefetchPriority,
      prefetchQueries: () => [
        { queryKey: ['userProfile', user?.id], staleTime: 10 * 60 * 1000 },
        { queryKey: ['studyStats', user?.id], staleTime: 5 * 60 * 1000 },
        { queryKey: ['todaysFocus', user?.id], staleTime: 2 * 60 * 1000 },
        { queryKey: ['goals', user?.id], staleTime: 10 * 60 * 1000 },
        { queryKey: ['userActivity', user?.id], staleTime: 5 * 60 * 1000 },
      ],
    },
    {
      routePattern: /^\/flashcards/,
      priority: 'high' as PrefetchPriority,
      prefetchQueries: () => [
        { queryKey: ['flashcardSets', user?.id], staleTime: 5 * 60 * 1000 },
        { queryKey: ['builtInFlashcardSets'], staleTime: 30 * 60 * 1000 },
        { queryKey: ['userProfile', user?.id], staleTime: 10 * 60 * 1000 },
      ],
    },
    {
      routePattern: /^\/study/,
      priority: 'high' as PrefetchPriority,
      prefetchQueries: () => [
        { queryKey: ['flashcardSets', user?.id], staleTime: 5 * 60 * 1000 },
        { queryKey: ['dueCards', user?.id], staleTime: 2 * 60 * 1000 },
        { queryKey: ['studyStats', user?.id], staleTime: 5 * 60 * 1000 },
      ],
    },
    {
      routePattern: /^\/analytics/,
      priority: 'medium' as PrefetchPriority,
      prefetchQueries: () => [
        { queryKey: ['studyStats', user?.id], staleTime: 5 * 60 * 1000 },
        { queryKey: ['flashcardStats', user?.id], staleTime: 10 * 60 * 1000 },
        { queryKey: ['userActivity', user?.id], staleTime: 5 * 60 * 1000 },
      ],
    },
    {
      routePattern: /^\/notes/,
      priority: 'medium' as PrefetchPriority,
      prefetchQueries: () => [
        { queryKey: ['notes', user?.id], staleTime: 5 * 60 * 1000 },
        { queryKey: ['noteSummaries', user?.id], staleTime: 10 * 60 * 1000 },
      ],
    },
  ]);

  // Track navigation patterns for machine learning-like optimization
  const recordNavigation = useCallback((from: string, to: string) => {
    const now = Date.now();
    const existingPattern = navigationHistory.current.find(
      p => p.from === from && p.to === to
    );

    if (existingPattern) {
      existingPattern.count++;
      existingPattern.lastAccess = now;
    } else {
      navigationHistory.current.push({
        from,
        to,
        count: 1,
        lastAccess: now,
      });
    }

    // Keep only recent patterns (last 7 days)
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    navigationHistory.current = navigationHistory.current.filter(
      p => p.lastAccess > sevenDaysAgo
    );

    // Limit history size
    if (navigationHistory.current.length > 100) {
      navigationHistory.current = navigationHistory.current
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);
    }
  }, []);

  // Predict likely next routes based on patterns
  const predictNextRoutes = useCallback((currentRoute: string): string[] => {
    const patterns = navigationHistory.current
      .filter(p => p.from === currentRoute)
      .sort((a, b) => {
        // Score based on frequency and recency
        const aScore = a.count * (1 + (Date.now() - a.lastAccess) / (24 * 60 * 60 * 1000));
        const bScore = b.count * (1 + (Date.now() - b.lastAccess) / (24 * 60 * 60 * 1000));
        return bScore - aScore;
      })
      .slice(0, 3) // Top 3 predictions
      .map(p => p.to);

    return patterns;
  }, []);

  // Execute prefetching based on current route
  const prefetchForRoute = useCallback(async (route: string) => {
    if (!user) return;

    // Find matching prefetch rules
    const matchingRules = prefetchRules.current.filter(rule => 
      rule.routePattern.test(route)
    );

    // Sort by priority
    const priorityOrder: Record<PrefetchPriority, number> = { high: 3, medium: 2, low: 1 };
    matchingRules.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    // Execute prefetching for each rule
    for (const rule of matchingRules) {
      try {
        const queries = rule.prefetchQueries({ userId: user.id });
        
        // Prefetch queries with appropriate timing based on priority
        const delay = rule.priority === 'high' ? 0 : 
                     rule.priority === 'medium' ? 500 : 1000;

        setTimeout(() => {
          queries.forEach(({ queryKey, staleTime }) => {
            queryClient.prefetchQuery({
              queryKey,
              staleTime: staleTime || 5 * 60 * 1000,
            });
          });
        }, delay);

        console.log(`🚀 [Prefetch] Scheduled ${queries.length} queries for ${route} (${rule.priority} priority)`);
      } catch (error) {
        console.warn(`⚠️ [Prefetch] Error prefetching for route ${route}:`, error);
      }
    }
  }, [user, queryClient]);

  // Prefetch based on navigation predictions
  const prefetchPredictedRoutes = useCallback(() => {
    const currentRoute = location.pathname;
    const predictedRoutes = predictNextRoutes(currentRoute);

    predictedRoutes.forEach((route, index) => {
      // Delay prefetching for predicted routes to avoid competing with current route
      setTimeout(() => {
        prefetchForRoute(route);
      }, (index + 1) * 1000);
    });

    if (predictedRoutes.length > 0) {
      console.log(`🔮 [Prefetch] Predicted routes for ${currentRoute}:`, predictedRoutes);
    }
  }, [location.pathname, predictNextRoutes, prefetchForRoute]);

  // Prefetch commonly accessed flashcard sets
  const prefetchPopularFlashcardSets = useCallback(async () => {
    if (!user) return;

    try {
      // Get user's flashcard sets
      const setsQuery = queryClient.getQueryData(['flashcardSets', user.id]) as any[];
      
      if (setsQuery && setsQuery.length > 0) {
        // Sort by last accessed or card count and prefetch top 3
        const topSets = setsQuery
          .sort((a, b) => (b.card_count || 0) - (a.card_count || 0))
          .slice(0, 3);

        topSets.forEach((set, index) => {
          setTimeout(() => {
            queryClient.prefetchQuery({
              queryKey: ['flashcards', set.id, user.id],
              staleTime: 3 * 60 * 1000,
            });
          }, index * 200);
        });

        console.log(`📚 [Prefetch] Preloaded top ${topSets.length} flashcard sets`);
      }
    } catch (error) {
      console.warn('⚠️ [Prefetch] Error prefetching flashcard sets:', error);
    }
  }, [user, queryClient]);

  // Track route changes and trigger prefetching
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Record navigation pattern
    if (previousLocation.current && previousLocation.current !== currentPath) {
      recordNavigation(previousLocation.current, currentPath);
    }
    
    // Prefetch for current route
    prefetchForRoute(currentPath);
    
    // Update previous location
    previousLocation.current = currentPath;
  }, [location.pathname, recordNavigation, prefetchForRoute]);

  // Periodic predictive prefetching
  useManagedInterval('predictive-prefetch', prefetchPredictedRoutes, 30 * 1000); // Every 30 seconds

  // Periodic popular content prefetching
  useManagedInterval('popular-content-prefetch', prefetchPopularFlashcardSets, 2 * 60 * 1000); // Every 2 minutes

  // Get prefetching statistics
  const getPrefetchStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    const prefetchedQueries = queries.filter(q => q.state.data && !q.getObserversCount());
    
    return {
      totalQueries: queries.length,
      prefetchedQueries: prefetchedQueries.length,
      navigationPatterns: navigationHistory.current.length,
      topNavigationPatterns: navigationHistory.current
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      sessionDuration: Math.round((Date.now() - sessionStartTime.current) / 1000 / 60), // minutes
    };
  }, [queryClient]);

  // Manual prefetch trigger for specific routes
  const triggerPrefetch = useCallback((routes: string[]) => {
    routes.forEach(route => {
      prefetchForRoute(route);
    });
  }, [prefetchForRoute]);

  return {
    // Core functions
    prefetchForRoute,
    prefetchPredictedRoutes,
    triggerPrefetch,
    
    // Analytics
    getPrefetchStats,
    predictNextRoutes: (route: string) => predictNextRoutes(route),
    
    // Current state
    currentRoute: location.pathname,
    navigationPatterns: navigationHistory.current,
  };
};

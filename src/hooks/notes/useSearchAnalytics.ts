import { useCallback } from 'react';

interface SearchAnalytics {
  term: string;
  timestamp: number;
  resultsCount?: number;
}

export const useSearchAnalytics = () => {
  const trackSearch = useCallback((term: string, resultsCount?: number) => {
    if (!term.trim() || process.env.NODE_ENV !== 'production') return;
    
    try {
      const analytics: SearchAnalytics[] = JSON.parse(
        localStorage.getItem('notes-search-analytics') || '[]'
      );
      
      analytics.push({
        term: term.trim(),
        timestamp: Date.now(),
        resultsCount
      });
      
      // Keep only last 100 searches to prevent localStorage bloat
      const recentAnalytics = analytics.slice(-100);
      localStorage.setItem('notes-search-analytics', JSON.stringify(recentAnalytics));
    } catch (error) {
      console.warn('Failed to track search analytics:', error);
    }
  }, []);

  const getPopularTerms = useCallback(() => {
    try {
      const analytics: SearchAnalytics[] = JSON.parse(
        localStorage.getItem('notes-search-analytics') || '[]'
      );
      
      // Get terms from last 7 days
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentSearches = analytics.filter(a => a.timestamp > weekAgo);
      
      // Count frequency
      const termCounts = recentSearches.reduce((acc, search) => {
        acc[search.term] = (acc[search.term] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Return sorted by frequency
      return Object.entries(termCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([term]) => term);
    } catch {
      return [];
    }
  }, []);

  return { trackSearch, getPopularTerms };
};


import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchNoteEnrichmentUsage } from '@/contexts/notes/operations';

/**
 * Hook for managing and fetching note enrichment usage statistics
 */
export const useEnrichmentUsageStats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current month in YYYY-MM format
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Get user's tier
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('user_tier')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      // Get usage count using the imported function
      const usageData = await fetchNoteEnrichmentUsage(currentMonth);
      
      // Get tier limit
      const { data: tierData, error: tierError } = await supabase
        .from('tier_limits')
        .select('note_enrichment_limit_per_month')
        .eq('tier', userData.user_tier)
        .single();
      
      if (tierError) {
        throw tierError;
      }
      
      // Update state
      setCurrentUsage(usageData?.length || 0);
      setMonthlyLimit(tierData?.note_enrichment_limit_per_month);
      
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      setError('Failed to fetch usage statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch usage stats when hook mounts
  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);
  
  const hasReachedLimit = useCallback(() => {
    // No limit if monthlyLimit is null (unlimited)
    if (monthlyLimit === null) return false;
    
    // Has reached limit if current usage >= monthly limit
    return currentUsage >= monthlyLimit;
  }, [currentUsage, monthlyLimit]);

  return {
    isLoading,
    currentUsage,
    monthlyLimit,
    error,
    fetchUsageStats,
    hasReachedLimit
  };
};

export default useEnrichmentUsageStats;

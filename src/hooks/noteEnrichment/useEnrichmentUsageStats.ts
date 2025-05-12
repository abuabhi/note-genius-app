
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancementUsage } from './types';
import { useUserTier } from '../useUserTier';

export function useEnrichmentUsageStats() {
  const [currentUsage, setCurrentUsage] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userTier } = useUserTier();

  useEffect(() => {
    if (userTier) {
      fetchUsageStats();
    }
  }, [userTier]);

  const fetchUsageStats = async (): Promise<EnhancementUsage> => {
    setIsLoading(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        console.error('Cannot check usage: No authenticated user found');
        setIsLoading(false);
        return { current: 0, limit: null };
      }
      
      // Get current month in YYYY-MM format
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Fetch usage count for current month
      const { data, error } = await supabase
        .from('note_enrichment_usage')
        .select('id')
        .eq('user_id', userId)
        .eq('month_year', currentMonth);
      
      if (error) throw error;
      
      // Get monthly limit from tier_limits
      const { data: tierData, error: tierError } = await supabase
        .from('tier_limits')
        .select('note_enrichment_limit_per_month')
        .eq('tier', userTier)
        .single();
      
      if (tierError) throw tierError;
      
      const usage = {
        current: data.length,
        limit: tierData?.note_enrichment_limit_per_month
      };
      
      setCurrentUsage(usage.current);
      setMonthlyLimit(usage.limit);
      setIsLoading(false);
      
      return usage;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      setIsLoading(false);
      return { current: 0, limit: null };
    }
  };

  const hasReachedLimit = (): boolean => {
    if (monthlyLimit === null) return false; // No limit
    return currentUsage >= monthlyLimit;
  };

  return {
    currentUsage,
    monthlyLimit,
    isLoading,
    fetchUsageStats,
    hasReachedLimit
  };
}

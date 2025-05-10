
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancementUsage } from './types';

export function useUsageStats() {
  const [currentUsage, setCurrentUsage] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(null);

  const fetchUsageStats = async (): Promise<EnhancementUsage> => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      if (!userId) {
        console.error('Cannot check usage: No authenticated user found');
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
        .eq('tier', 'SCHOLAR') // Using a default value since we can't get it from userProfile
        .single();
      
      if (tierError) throw tierError;
      
      const usage = {
        current: data.length,
        limit: tierData?.note_enrichment_limit_per_month || null
      };
      
      setCurrentUsage(usage.current);
      setMonthlyLimit(usage.limit);
      
      return usage;
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return { current: 0, limit: null };
    }
  };

  const hasReachedLimit = (usage: EnhancementUsage): boolean => {
    return usage.limit !== null && usage.current >= usage.limit;
  };

  return {
    currentUsage,
    monthlyLimit,
    fetchUsageStats,
    hasReachedLimit
  };
}

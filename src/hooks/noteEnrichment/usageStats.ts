
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TokenUsage } from './types';

export function useNoteEnrichmentStats() {
  const [currentUsage, setCurrentUsage] = useState<number>(0);
  const [monthlyLimit, setMonthlyLimit] = useState<number | null>(null);
  const [lastTokenUsage, setLastTokenUsage] = useState<TokenUsage | null>(null);

  // Fetch current usage statistics
  const fetchUsageStats = async (userId: string | undefined) => {
    if (!userId) return;
    
    try {
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
      
      setCurrentUsage(data.length);
      setMonthlyLimit(tierData.note_enrichment_limit_per_month);
      
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  return {
    currentUsage,
    monthlyLimit,
    lastTokenUsage,
    setLastTokenUsage,
    fetchUsageStats
  };
}

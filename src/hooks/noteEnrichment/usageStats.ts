
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches usage statistics for note enrichment
 * @param monthYear The month and year to fetch statistics for (YYYY-MM)
 * @returns Promise with the usage data
 */
export const fetchUsageStats = async (monthYear: string) => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('note_enrichment_usage')
      .select('id, created_at, prompt_tokens, completion_tokens')
      .eq('user_id', userId)
      .eq('month_year', monthYear);
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching usage statistics:', error);
    throw error;
  }
};

/**
 * Calculates token usage statistics for the current month
 * @returns Promise with token usage totals
 */
export const calculateTokenUsage = async () => {
  const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
  
  try {
    const usageRecords = await fetchUsageStats(currentMonth);
    
    if (!usageRecords?.length) {
      return {
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        requestCount: 0
      };
    }
    
    // Calculate totals
    const totals = usageRecords.reduce((acc, record) => {
      const promptTokens = record.prompt_tokens || 0;
      const completionTokens = record.completion_tokens || 0;
      
      return {
        totalPromptTokens: acc.totalPromptTokens + promptTokens,
        totalCompletionTokens: acc.totalCompletionTokens + completionTokens,
        totalTokens: acc.totalTokens + promptTokens + completionTokens,
        requestCount: acc.requestCount + 1
      };
    }, {
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      requestCount: 0
    });
    
    return totals;
  } catch (error) {
    console.error('Error calculating token usage:', error);
    throw error;
  }
};

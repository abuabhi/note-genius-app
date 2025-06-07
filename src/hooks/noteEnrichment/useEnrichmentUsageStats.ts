
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
      console.log("📊 Fetching usage stats...");
      
      // Get current month in YYYY-MM format
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }
      
      console.log("👤 User authenticated:", user.id);
      
      // Get user's tier
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('user_tier')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        console.error('Error fetching user tier:', userError);
        // Set default values if we can't fetch user tier
        setCurrentUsage(0);
        setMonthlyLimit(10); // Default limit for students
        setIsLoading(false);
        return;
      }
      
      console.log("🎓 User tier:", userData.user_tier);
      
      // Get usage count using the imported function
      const usageData = await fetchNoteEnrichmentUsage(currentMonth);
      
      console.log("📈 Usage data:", usageData?.length || 0);
      
      // FIXED: Better tier normalization with proper type handling
      const rawTier = userData.user_tier;
      let normalizedTier: 'SCHOLAR' | 'GRADUATE' | 'MASTER' | 'DEAN';
      
      // Convert to string for comparison to handle legacy 'STUDENT' tier
      const tierString = String(rawTier);
      if (tierString === 'STUDENT' || !rawTier) {
        normalizedTier = 'SCHOLAR'; // Map legacy STUDENT tier to SCHOLAR
      } else {
        normalizedTier = rawTier as 'SCHOLAR' | 'GRADUATE' | 'MASTER' | 'DEAN';
      }
      
      console.log("🔄 Normalized tier:", normalizedTier);
      
      // Get tier limit
      const { data: tierData, error: tierError } = await supabase
        .from('tier_limits')
        .select('note_enrichment_limit_per_month')
        .eq('tier', normalizedTier)
        .single();
      
      if (tierError) {
        console.error('Error fetching tier limits:', tierError);
        // Set default values if we can't fetch tier limits
        setCurrentUsage(usageData?.length || 0);
        setMonthlyLimit(10); // Default limit
      } else {
        console.log("💎 Tier limits:", tierData);
        // Update state with fetched data
        setCurrentUsage(usageData?.length || 0);
        // FIXED: Properly handle unlimited tiers (DEAN should have null limit)
        const limit = tierData?.note_enrichment_limit_per_month;
        setMonthlyLimit(limit === -1 ? null : limit); // Convert -1 to null for unlimited
      }
      
      console.log("✅ Usage stats updated:", {
        usage: usageData?.length || 0,
        limit: tierData?.note_enrichment_limit_per_month === -1 ? 'unlimited' : tierData?.note_enrichment_limit_per_month
      });
      
    } catch (err) {
      console.error('❌ Error fetching usage stats:', err);
      setError('Failed to fetch usage statistics');
      // Set default values on error
      setCurrentUsage(0);
      setMonthlyLimit(10);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch usage stats when hook mounts
  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);
  
  const hasReachedLimit = useCallback(() => {
    // FIXED: No limit if monthlyLimit is null (unlimited) - this is key for DEAN tier
    if (monthlyLimit === null) {
      console.log("🚀 Unlimited tier - no limit reached");
      return false;
    }
    
    // Has reached limit if current usage >= monthly limit
    const limitReached = currentUsage >= monthlyLimit;
    console.log("🔍 Limit check:", { currentUsage, monthlyLimit, limitReached });
    return limitReached;
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

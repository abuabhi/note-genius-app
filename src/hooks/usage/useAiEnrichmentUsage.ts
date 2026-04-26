import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchNoteEnrichmentUsage } from '@/contexts/notes/operations/usageStats';

// UI-only mirror of server tier limits for AI enrichment
// Keep in sync with edge function TIER_LIMITS
const TIER_LIMITS: Record<string, number | null> = {
  SCHOLAR: 20,
  GRADUATE: 100,
  MASTER: 500,
  DEAN: null, // Unlimited
};

interface UsageResult {
  usageCount: number;
  monthlyLimit: number | null;
  userTier: string | null;
}

const getMonthYear = () => new Date().toISOString().slice(0, 7);

export const useAiEnrichmentUsage = () => {
  const monthYear = getMonthYear();

  const { data, isLoading, refetch, error } = useQuery<UsageResult>({
    queryKey: ['ai-enrichment-usage', monthYear],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) return { usageCount: 0, monthlyLimit: null, userTier: null };

      const [usageRows, profileRes] = await Promise.all([
        fetchNoteEnrichmentUsage(monthYear),
        supabase.from('profiles').select('user_tier').eq('id', userId).single(),
      ]);

      const tier = (profileRes.data as any)?.user_tier ?? null;
      const limit = tier ? (TIER_LIMITS[tier] ?? null) : null;

      return {
        usageCount: usageRows?.length ?? 0,
        monthlyLimit: limit,
        userTier: tier,
      };
    },
    staleTime: 60 * 1000,
  });

  const usageCount = data?.usageCount ?? 0;
  const monthlyLimit = data?.monthlyLimit ?? null;
  const percentage = monthlyLimit ? Math.min(Math.round((usageCount / monthlyLimit) * 100), 100) : 0;
  const hasReachedLimit = monthlyLimit !== null && usageCount >= monthlyLimit;
  const isNearLimit = monthlyLimit !== null && percentage >= 80 && percentage < 100;

  return {
    usageCount,
    monthlyLimit,
    userTier: data?.userTier ?? null,
    isLoading,
    error,
    percentage,
    hasReachedLimit,
    isNearLimit,
    refetch,
  };
};

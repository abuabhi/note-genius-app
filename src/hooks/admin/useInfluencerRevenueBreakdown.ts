import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RevenueByTier {
  tier: string;
  totalRevenue: number;
  percentage: number;
}

export const useInfluencerRevenueBreakdown = () => {
  return useQuery({
    queryKey: ['influencer-revenue-breakdown'],
    queryFn: async (): Promise<RevenueByTier[]> => {
      // Get coupon usage data with influencer tier information
      const { data } = await supabase
        .from('coupon_usage')
        .select(`
          order_value,
          profiles!inner(influencer_tier)
        `)
        .eq('status', 'active');

      if (!data || data.length === 0) {
        // Return default structure if no data
        return [
          { tier: 'MASTER', totalRevenue: 0, percentage: 0 },
          { tier: 'GRADUATE', totalRevenue: 0, percentage: 0 }
        ];
      }

      // Group revenue by tier
      const revenueByTier = new Map<string, number>();
      let totalRevenue = 0;

      data.forEach((usage: any) => {
        const tier = usage.profiles?.influencer_tier || 'GRADUATE';
        const revenue = usage.order_value || 0;
        
        revenueByTier.set(tier, (revenueByTier.get(tier) || 0) + revenue);
        totalRevenue += revenue;
      });

      // Calculate percentages and format results
      const result: RevenueByTier[] = [];
      
      for (const [tier, revenue] of revenueByTier.entries()) {
        result.push({
          tier,
          totalRevenue: revenue,
          percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
        });
      }

      // Ensure we always have MASTER and GRADUATE tiers
      const tiers = ['MASTER', 'GRADUATE'];
      for (const tier of tiers) {
        if (!result.find(r => r.tier === tier)) {
          result.push({
            tier,
            totalRevenue: 0,
            percentage: 0
          });
        }
      }

      // Sort by tier (MASTER first)
      return result.sort((a, b) => {
        if (a.tier === 'MASTER') return -1;
        if (b.tier === 'MASTER') return 1;
        return 0;
      });
    },
  });
};
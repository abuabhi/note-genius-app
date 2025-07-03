import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InfluencerKPIs {
  totalInfluencers: number;
  activeInfluencers: number;
  totalRevenue: number;
  totalCommissions: number;
  totalCouponUsage: number;
  conversionRate: number;
  pendingPayouts: number;
}

export interface TopPerformer {
  id: string;
  username: string;
  totalRevenue: number;
  totalCommissions: number;
  usageCount: number;
  conversionRate: number;
  tier: string;
}

export const useInfluencerAnalytics = () => {
  return useQuery({
    queryKey: ['influencer-analytics'],
    queryFn: async (): Promise<InfluencerKPIs> => {
      // Get total influencers
      const { data: influencers } = await supabase
        .from('profiles')
        .select('id, is_influencer, influencer_expires_at')
        .eq('is_influencer', true);

      const totalInfluencers = influencers?.length || 0;
      const activeInfluencers = influencers?.filter(inf => 
        !inf.influencer_expires_at || new Date(inf.influencer_expires_at) > new Date()
      ).length || 0;

      // Get coupon usage data
      const { data: couponUsage } = await supabase
        .from('coupon_usage')
        .select('order_value, commission_amount')
        .eq('status', 'active');

      const totalRevenue = couponUsage?.reduce((sum, usage) => 
        sum + (usage.order_value || 0), 0) || 0;
      const totalCommissions = couponUsage?.reduce((sum, usage) => 
        sum + (usage.commission_amount || 0), 0) || 0;
      const totalCouponUsage = couponUsage?.length || 0;

      // Get pending payouts
      const { data: pendingPayouts } = await supabase
        .from('influencer_payouts')
        .select('total_commission')
        .eq('status', 'pending');

      const pendingPayoutAmount = pendingPayouts?.reduce((sum, payout) => 
        sum + (payout.total_commission || 0), 0) || 0;

      return {
        totalInfluencers,
        activeInfluencers,
        totalRevenue,
        totalCommissions,
        totalCouponUsage,
        conversionRate: totalCouponUsage > 0 ? (totalRevenue / totalCouponUsage) : 0,
        pendingPayouts: pendingPayoutAmount,
      };
    },
  });
};

export const useTopPerformers = (limit: number = 10) => {
  return useQuery({
    queryKey: ['top-performers', limit],
    queryFn: async (): Promise<TopPerformer[]> => {
      const { data } = await supabase
        .from('coupon_usage')
        .select(`
          influencer_id,
          order_value,
          commission_amount,
          profiles!inner(username, influencer_tier)
        `)
        .eq('status', 'active');

      if (!data) return [];

      // Group by influencer
      const performerMap = new Map<string, {
        id: string;
        username: string;
        tier: string;
        totalRevenue: number;
        totalCommissions: number;
        usageCount: number;
      }>();

      data.forEach((usage: any) => {
        const influencerId = usage.influencer_id;
        const existing = performerMap.get(influencerId) || {
          id: influencerId,
          username: usage.profiles?.username || 'Unknown',
          tier: usage.profiles?.influencer_tier || 'GRADUATE',
          totalRevenue: 0,
          totalCommissions: 0,
          usageCount: 0,
        };

        existing.totalRevenue += usage.order_value || 0;
        existing.totalCommissions += usage.commission_amount || 0;
        existing.usageCount += 1;

        performerMap.set(influencerId, existing);
      });

      // Convert to array and calculate conversion rate
      const performers = Array.from(performerMap.values()).map(performer => ({
        ...performer,
        conversionRate: performer.usageCount > 0 ? (performer.totalRevenue / performer.usageCount) : 0,
      }));

      // Sort by total revenue and limit
      return performers
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);
    },
  });
};
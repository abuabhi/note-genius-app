import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface InfluencerPerformance {
  couponCode: string;
  totalUses: number;
  totalRevenue: number;
  totalCommission: number;
  thisMonthUses: number;
  thisMonthCommission: number;
  avgOrderValue: number;
}

export const useInfluencerPerformance = (influencerId: string) => {
  return useQuery({
    queryKey: ['influencer-performance', influencerId],
    queryFn: async (): Promise<InfluencerPerformance> => {
      // Get coupon usage data for this specific influencer
      const { data: couponUsage } = await supabase
        .from('coupon_usage')
        .select('order_value, commission_amount, created_at')
        .eq('influencer_id', influencerId)
        .eq('status', 'active');

      // Get influencer's coupon code
      const { data: couponData } = await supabase
        .from('influencer_coupons')
        .select('coupon_code')
        .eq('influencer_id', influencerId)
        .single();

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      if (!couponUsage || couponUsage.length === 0) {
        return {
          couponCode: couponData?.coupon_code || 'N/A',
          totalUses: 0,
          totalRevenue: 0,
          totalCommission: 0,
          thisMonthUses: 0,
          thisMonthCommission: 0,
          avgOrderValue: 0
        };
      }

      // Calculate total metrics
      const totalUses = couponUsage.length;
      const totalRevenue = couponUsage.reduce((sum, usage) => sum + (usage.order_value || 0), 0);
      const totalCommission = couponUsage.reduce((sum, usage) => sum + (usage.commission_amount || 0), 0);

      // Calculate this month's metrics
      const thisMonthUsage = couponUsage.filter(usage => {
        const usageDate = new Date(usage.created_at);
        return usageDate.getMonth() === currentMonth && usageDate.getFullYear() === currentYear;
      });

      const thisMonthUses = thisMonthUsage.length;
      const thisMonthCommission = thisMonthUsage.reduce((sum, usage) => sum + (usage.commission_amount || 0), 0);

      // Calculate average order value
      const avgOrderValue = totalUses > 0 ? totalRevenue / totalUses : 0;

      return {
        couponCode: couponData?.coupon_code || 'N/A',
        totalUses,
        totalRevenue,
        totalCommission,
        thisMonthUses,
        thisMonthCommission,
        avgOrderValue
      };
    },
    enabled: !!influencerId,
  });
};
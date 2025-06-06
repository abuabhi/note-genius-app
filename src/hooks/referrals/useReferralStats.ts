
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { ReferralStats } from './types';

export const useReferralStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async (): Promise<ReferralStats> => {
      if (!user) throw new Error('No user');

      try {
        // Get or create user's referral code from profiles
        let { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        let referralCode = (profile as any)?.referral_code;

        // Generate referral code if it doesn't exist
        if (!referralCode) {
          referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ referral_code: referralCode })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating referral code:', updateError);
            referralCode = 'TEMP' + Math.random().toString(36).substring(2, 6).toUpperCase();
          }
        }

        // Get referral statistics from the new referrals table
        const { data: referrals } = await supabase
          .from('referrals')
          .select('status, points_awarded')
          .eq('referrer_id', user.id);

        const totalReferrals = referrals?.length || 0;
        const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
        const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
        const totalPointsEarned = referrals?.reduce((sum, r) => sum + (r.points_awarded || 0), 0) || 0;

        return {
          totalReferrals,
          completedReferrals,
          pendingReferrals,
          totalPointsEarned,
          referralCode
        };
      } catch (error) {
        console.error('Error fetching referral stats:', error);
        return {
          totalReferrals: 0,
          completedReferrals: 0,
          pendingReferrals: 0,
          totalPointsEarned: 0,
          referralCode: 'LOADING'
        };
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

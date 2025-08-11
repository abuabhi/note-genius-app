
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

      // 1) Get or create the user's referral code via secure RPC
      console.log('🔗 Fetching referral code via RPC for user:', user.id);
      const { data: rpcReferralCode, error: rpcError } = await supabase.rpc('get_my_referral_code');

      if (rpcError) {
        console.error('Error fetching referral code via RPC:', rpcError);
        // Let React Query handle the error state
        throw rpcError;
      }

      // Determine user's referral code with robust fallbacks
      let resolvedCode = (rpcReferralCode ?? '').toString().trim();

      if (!resolvedCode) {
        // Fallback 1: read from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile referral_code:', profileError);
        } else if (profile?.referral_code) {
          resolvedCode = String(profile.referral_code).trim();
        }
      }

      if (!resolvedCode) {
        // Fallback 2: server-side create if missing
        const { data: createdCode, error: createErr } = await supabase.rpc(
          'get_or_create_referral_code',
          { p_user_id: user.id }
        );
        if (createErr) {
          console.error('Error creating referral code via RPC:', createErr);
        } else if (createdCode) {
          resolvedCode = String(createdCode).trim();
        }
      }

      const referralCode = resolvedCode;

      // 2) Aggregate referral stats for this user
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('status, points_awarded')
        .eq('referrer_id', user.id);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        throw referralsError;
      }

      const totalReferrals = referrals?.length || 0;
      const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const totalPointsEarned = referrals?.reduce((sum, r) => sum + (r.points_awarded || 0), 0) || 0;

      return {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalPointsEarned,
        referralCode,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

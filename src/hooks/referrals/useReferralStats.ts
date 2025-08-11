
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

      const cacheKey = `referralCode:${user.id}`;
      let resolvedCode = '';

      // Try local cache first
      try {
        const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
        if (cached) {
          resolvedCode = cached.trim();
          console.log('🔗 Using cached referral code:', resolvedCode);
        }
      } catch (e) {
        console.warn('LocalStorage unavailable for referral code cache:', e);
      }

      // Try to get or create securely (primary path)
      if (!resolvedCode) {
        console.log('🔗 Attempting get_or_create_referral_code for user:', user.id);
        const { data: createdCode, error: createErr } = await supabase.rpc(
          'get_or_create_referral_code',
          { p_user_id: user.id }
        );
        if (createErr) {
          console.warn('get_or_create_referral_code failed:', createErr);
        } else if (createdCode) {
          resolvedCode = String(createdCode).trim();
        }
      }

      // Fallback: get_my_referral_code
      if (!resolvedCode) {
        console.log('🔗 Attempting get_my_referral_code for user:', user.id);
        const { data: rpcReferralCode, error: rpcError } = await supabase.rpc('get_my_referral_code');
        if (rpcError) {
          console.warn('get_my_referral_code failed:', rpcError);
        } else if (rpcReferralCode) {
          resolvedCode = String(rpcReferralCode).trim();
        }
      }

      // Fallback: read from profiles table
      if (!resolvedCode) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('referral_code')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.warn('Profile referral_code fetch failed:', profileError);
        } else if (profile?.referral_code) {
          resolvedCode = String(profile.referral_code).trim();
        }
      }

      // Cache for future use
      if (resolvedCode) {
        try {
          if (typeof window !== 'undefined') localStorage.setItem(cacheKey, resolvedCode);
        } catch {}
      }

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
        referralCode: resolvedCode,
      };
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
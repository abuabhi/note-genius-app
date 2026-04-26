import { useReferralStats } from './useReferralStats';
import { useContests, useContestEntries } from './useContests';
import { useContestActions } from './useContestActions';
import { useSharingUtils } from './useSharingUtils';
import type { Contest, ContestEntry } from './types';

/**
 * NOTE: Contests/entries queries are intentionally NOT invoked here because the
 * current SimplifiedReferralForm UI does not display them. Including them
 * caused extra Supabase round-trips on every Referrals page load and
 * contributed to slow open times. Components that need contests should call
 * `useContests` / `useContestEntries` / `useContestActions` directly.
 */
export const useReferralData = () => {
  const { data: referralStats, isLoading: statsLoading, error: statsError, refetch: refetchReferralStats } = useReferralStats();
  const { generateReferralLink, copyReferralLink, shareViaLinkedIn, shareViaTwitter, generateRecommendedMessage, shareViaWhatsApp, shareViaEmail } = useSharingUtils();

  const isLoading = statsLoading;
  const hasError = !!statsError;

  const safeReferralStats = isLoading
    ? {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalPointsEarned: 0,
        referralCode: '',
      }
    : {
        totalReferrals: referralStats?.totalReferrals ?? 0,
        completedReferrals: referralStats?.completedReferrals ?? 0,
        pendingReferrals: referralStats?.pendingReferrals ?? 0,
        totalPointsEarned: referralStats?.totalPointsEarned ?? 0,
        referralCode: '',
      };

  return {
    referralStats: safeReferralStats,
    contests: [] as Contest[],
    contestEntries: [] as ContestEntry[],
    isLoading,
    hasError,
    joinContest: (_contestId: string) => {
      console.warn('joinContest called from useReferralData stub — call useContestActions directly.');
    },
    isJoiningContest: false,
    generateReferralLink,
    copyReferralLink,
    shareViaLinkedIn,
    shareViaTwitter,
    generateRecommendedMessage,
    shareViaWhatsApp,
    shareViaEmail,
    refetchReferralStats,
  };
};

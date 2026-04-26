import { useReferralStats } from './useReferralStats';
import { useContests, useContestEntries } from './useContests';
import { useContestActions } from './useContestActions';
import { useSharingUtils } from './useSharingUtils';

/**
 * NOTE: Contests/entries queries are intentionally NOT invoked here because the
 * current SimplifiedReferralForm UI does not display them. Including them
 * caused extra Supabase round-trips on every Referrals page load and
 * contributed to slow open times. If a future component needs contests, call
 * `useContests` / `useContestEntries` directly from that component.
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
    referralCode: ''
  }
  : {
    totalReferrals: referralStats?.totalReferrals ?? 0,
    completedReferrals: referralStats?.completedReferrals ?? 0,
    pendingReferrals: referralStats?.pendingReferrals ?? 0,
    totalPointsEarned: referralStats?.totalPointsEarned ?? 0,
    referralCode: ''
  };

  return {
    referralStats: safeReferralStats,
    contests: [] as never[],
    contestEntries: [] as never[],
    isLoading,
    hasError,
    joinContest: undefined,
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

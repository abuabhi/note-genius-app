
import { useReferralStats } from './useReferralStats';
import { useContests, useContestEntries } from './useContests';
import { useContestActions } from './useContestActions';
import { useSharingUtils } from './useSharingUtils';

export const useReferralData = () => {
  const { data: referralStats, isLoading: statsLoading, error: statsError } = useReferralStats();
  const { data: contests = [], isLoading: contestsLoading } = useContests();
  const { data: contestEntries = [], isLoading: entriesLoading } = useContestEntries();
  const { joinContest, isJoiningContest } = useContestActions();
  const { generateReferralLink, shareViaWhatsApp, copyReferralLink, shareViaEmail, shareViaLinkedIn, shareViaTwitter, generateQRCode } = useSharingUtils();

  // Handle error states gracefully
  const isLoading = statsLoading || contestsLoading || entriesLoading;
  const hasError = !!statsError;

  // Don't return data if still loading to prevent suspension
  const safeReferralStats = isLoading ? null : referralStats;
  const safeContests = isLoading ? [] : contests;
  const safeContestEntries = isLoading ? [] : contestEntries;

  return {
    referralStats: safeReferralStats,
    contests: safeContests,
    contestEntries: safeContestEntries,
    isLoading,
    hasError,
    joinContest,
    isJoiningContest,
    generateReferralLink,
    shareViaWhatsApp,
    copyReferralLink,
    shareViaEmail,
    shareViaLinkedIn,
    shareViaTwitter,
    generateQRCode
  };
};

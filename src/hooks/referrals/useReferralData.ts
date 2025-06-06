
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

  // Always return consistent data structure, never return null/undefined for arrays
  const safeReferralStats = isLoading ? {
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalPointsEarned: 0,
    referralCode: 'LOADING'
  } : referralStats;
  
  const safeContests = contests || [];
  const safeContestEntries = contestEntries || [];

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

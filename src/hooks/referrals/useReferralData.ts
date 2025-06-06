
import { useReferralStats } from './useReferralStats';
import { useContests, useContestEntries } from './useContests';
import { useContestActions } from './useContestActions';
import { useSharingUtils } from './useSharingUtils';

export const useReferralData = () => {
  const { data: referralStats, isLoading: statsLoading } = useReferralStats();
  const { data: contests = [], isLoading: contestsLoading } = useContests();
  const { data: contestEntries = [], isLoading: entriesLoading } = useContestEntries();
  const { joinContest, isJoiningContest } = useContestActions();
  const { generateReferralLink, shareViaWhatsApp, copyReferralLink } = useSharingUtils();

  return {
    referralStats,
    contests,
    contestEntries,
    isLoading: statsLoading || contestsLoading || entriesLoading,
    joinContest,
    isJoiningContest,
    generateReferralLink,
    shareViaWhatsApp,
    copyReferralLink
  };
};

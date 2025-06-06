
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useContests } from './useContests';
import { useReferralStats } from './useReferralStats';

export const useContestActions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: contests = [] } = useContests();
  const { data: referralStats } = useReferralStats();

  const joinContestMutation = useMutation({
    mutationFn: async (contestId: string) => {
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('contest_entries')
        .insert({
          contest_id: contestId,
          user_id: user.id,
          referrals_count: referralStats?.completedReferrals || 0,
          is_eligible: (referralStats?.completedReferrals || 0) >= 
                      (contests.find(c => c.id === contestId)?.min_referrals_required || 1)
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contest-entries'] });
      toast.success('Successfully joined the contest!');
    },
    onError: (error: any) => {
      toast.error('Failed to join contest: ' + error.message);
    }
  });

  return {
    joinContest: joinContestMutation.mutate,
    isJoiningContest: joinContestMutation.isPending,
  };
};

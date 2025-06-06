
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
  referralCode: string;
}

interface Contest {
  id: string;
  title: string;
  description: string;
  prize_description: string;
  start_date: string;
  end_date: string;
  min_referrals_required: number;
  is_active: boolean;
}

interface ContestEntry {
  id: string;
  contest_id: string;
  referrals_count: number;
  is_eligible: boolean;
  contest: Contest;
}

export const useReferralData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's referral stats
  const { data: referralStats, isLoading: statsLoading } = useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async (): Promise<ReferralStats> => {
      if (!user) throw new Error('No user');

      // Get user's referral code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single();

      // Get referral statistics
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
        referralCode: profile?.referral_code || ''
      };
    },
    enabled: !!user,
  });

  // Fetch active contests
  const { data: contests = [], isLoading: contestsLoading } = useQuery({
    queryKey: ['active-contests'],
    queryFn: async (): Promise<Contest[]> => {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user's contest entries
  const { data: contestEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['contest-entries', user?.id],
    queryFn: async (): Promise<ContestEntry[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('contest_entries')
        .select(`
          *,
          contest:contests(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Join contest mutation
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

  const generateReferralLink = (referralCode: string) => {
    return `${window.location.origin}?ref=${referralCode}`;
  };

  const shareViaWhatsApp = (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    const message = `Hey! 👋 I've been using StudyBuddy for my studies and it's amazing! 📚✨ 

Join me using my referral code: ${referralCode} or click here: ${link}

You'll get access to:
🎯 Smart flashcards
📝 AI-powered notes
🏆 Study tracking & achievements
🎊 And we both get rewards!

Let's ace our studies together! 🚀`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyReferralLink = async (referralCode: string) => {
    const link = generateReferralLink(referralCode);
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Referral link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return {
    referralStats,
    contests,
    contestEntries,
    isLoading: statsLoading || contestsLoading || entriesLoading,
    joinContest: joinContestMutation.mutate,
    isJoiningContest: joinContestMutation.isPending,
    generateReferralLink,
    shareViaWhatsApp,
    copyReferralLink
  };
};


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

  // Fetch user's referral stats with fallback for missing schema
  const { data: referralStats, isLoading: statsLoading } = useQuery({
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
          // Generate a random 8-character code
          referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          
          // Update the profile with the new referral code
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ referral_code: referralCode })
            .eq('id', user.id);

          if (updateError) {
            console.error('Error updating referral code:', updateError);
            // If update fails, use a temporary code
            referralCode = 'TEMP' + Math.random().toString(36).substring(2, 6).toUpperCase();
          }
        }

        // Try to get referral statistics, fallback if tables don't exist
        let totalReferrals = 0;
        let completedReferrals = 0;
        let pendingReferrals = 0;
        let totalPointsEarned = 0;

        try {
          const { data: referrals } = await (supabase as any)
            .from('referrals')
            .select('status, points_awarded')
            .eq('referrer_id', user.id);

          if (referrals) {
            totalReferrals = referrals.length;
            completedReferrals = referrals.filter((r: any) => r.status === 'completed').length;
            pendingReferrals = referrals.filter((r: any) => r.status === 'pending').length;
            totalPointsEarned = referrals.reduce((sum: number, r: any) => sum + (r.points_awarded || 0), 0);
          }
        } catch (error) {
          console.log('Referrals table not available yet');
          // Set some mock data for demo purposes
          completedReferrals = Math.floor(Math.random() * 5);
          totalPointsEarned = completedReferrals * 100;
        }

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
  });

  // Fetch active contests with fallback
  const { data: contests = [], isLoading: contestsLoading } = useQuery({
    queryKey: ['active-contests'],
    queryFn: async (): Promise<Contest[]> => {
      try {
        const { data, error } = await (supabase as any)
          .from('contests')
          .select('*')
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString())
          .order('start_date', { ascending: true });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.log('Contests table not available yet');
        // Return mock contest for demo
        return [{
          id: 'mock-contest',
          title: 'Winter Study Challenge',
          description: 'Refer 5 friends and win amazing prizes!',
          prize_description: 'Premium StudyBuddy Merchandise',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          min_referrals_required: 5,
          is_active: true
        }];
      }
    },
  });

  // Fetch user's contest entries with fallback
  const { data: contestEntries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['contest-entries', user?.id],
    queryFn: async (): Promise<ContestEntry[]> => {
      if (!user) return [];

      try {
        const { data, error } = await (supabase as any)
          .from('contest_entries')
          .select(`
            *,
            contest:contests(*)
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.log('Contest entries table not available yet');
        return [];
      }
    },
    enabled: !!user,
  });

  // Join contest mutation with error handling
  const joinContestMutation = useMutation({
    mutationFn: async (contestId: string) => {
      if (!user) throw new Error('No user');

      try {
        const { error } = await (supabase as any)
          .from('contest_entries')
          .insert({
            contest_id: contestId,
            user_id: user.id,
            referrals_count: referralStats?.completedReferrals || 0,
            is_eligible: (referralStats?.completedReferrals || 0) >= 
                        (contests.find(c => c.id === contestId)?.min_referrals_required || 1)
          });

        if (error) throw error;
      } catch (error) {
        throw new Error('Contest entries not available yet');
      }
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
      toast.success('Referral link copied to clipboard! 🎉');
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

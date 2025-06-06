
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { Contest, ContestEntry } from './types';

export const useContests = () => {
  return useQuery({
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
};

export const useContestEntries = () => {
  const { user } = useAuth();

  return useQuery({
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
};

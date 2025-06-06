
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { Contest, ContestEntry } from './types';

export const useContests = () => {
  return useQuery({
    queryKey: ['active-contests'],
    queryFn: async (): Promise<Contest[]> => {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching contests:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useContestEntries = () => {
  const { user } = useAuth();

  return useQuery({
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

      if (error) {
        console.error('Error fetching contest entries:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

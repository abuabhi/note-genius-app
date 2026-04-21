import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface DashboardCounts {
  notes: number;
  flashcardSets: number;
  quizzes: number;
  activeGoals: number;
}

const EMPTY: DashboardCounts = { notes: 0, flashcardSets: 0, quizzes: 0, activeGoals: 0 };

/**
 * Single-RPC dashboard counts. Replaces 4 parallel `select('id')` queries.
 */
export const useDashboardCounts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-counts', user?.id],
    queryFn: async (): Promise<DashboardCounts> => {
      if (!user) return EMPTY;
      const { data, error } = await supabase.rpc('dashboard_counts', { _user_id: user.id });
      if (error) {
        console.error('[useDashboardCounts] RPC failed', error);
        return EMPTY;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) return EMPTY;
      return {
        notes: Number(row.notes_count) || 0,
        flashcardSets: Number(row.flashcard_sets_count) || 0,
        quizzes: Number(row.quizzes_count) || 0,
        activeGoals: Number(row.active_goals_count) || 0,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

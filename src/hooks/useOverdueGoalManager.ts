
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface OverdueGoal {
  goal_id: string;
  title: string;
  end_date: string;
  days_overdue: number;
  in_grace_period: boolean;
}

export interface OverdueGoalActions {
  extendGoal: (goalId: string, additionalDays: number) => Promise<boolean>;
  pauseGoal: (goalId: string) => Promise<boolean>;
  archiveGoal: (goalId: string, reason: string) => Promise<boolean>;
  deleteGoal: (goalId: string) => Promise<boolean>;
}

export const useOverdueGoalManager = () => {
  const { user } = useAuth();
  const [overdueGoals, setOverdueGoals] = useState<OverdueGoal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOverdueGoals = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_overdue_goals', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching overdue goals:', error);
        return;
      }

      setOverdueGoals(data || []);
    } catch (error) {
      console.error('Error fetching overdue goals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const extendGoal = async (goalId: string, additionalDays: number): Promise<boolean> => {
    if (!user) return false;

    try {
      // Calculate new end date
      const { data: currentGoal, error: fetchError } = await supabase
        .from('study_goals')
        .select('end_date, extension_count')
        .eq('id', goalId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !currentGoal) {
        toast.error('Failed to fetch goal details');
        return false;
      }

      const currentEndDate = new Date(currentGoal.end_date);
      const newEndDate = new Date(currentEndDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

      const { error } = await supabase
        .from('study_goals')
        .update({
          end_date: newEndDate.toISOString().split('T')[0],
          extension_count: (currentGoal.extension_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error extending goal:', error);
        toast.error('Failed to extend goal');
        return false;
      }

      toast.success(`Goal extended by ${additionalDays} days`);
      await fetchOverdueGoals();
      return true;
    } catch (error) {
      console.error('Error extending goal:', error);
      toast.error('Failed to extend goal');
      return false;
    }
  };

  const pauseGoal = async (goalId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('study_goals')
        .update({
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error pausing goal:', error);
        toast.error('Failed to pause goal');
        return false;
      }

      toast.success('Goal paused successfully');
      await fetchOverdueGoals();
      return true;
    } catch (error) {
      console.error('Error pausing goal:', error);
      toast.error('Failed to pause goal');
      return false;
    }
  };

  const archiveGoal = async (goalId: string, reason: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('study_goals')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
          archived_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error archiving goal:', error);
        toast.error('Failed to archive goal');
        return false;
      }

      toast.success('Goal archived successfully');
      await fetchOverdueGoals();
      return true;
    } catch (error) {
      console.error('Error archiving goal:', error);
      toast.error('Failed to archive goal');
      return false;
    }
  };

  const deleteGoal = async (goalId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('study_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting goal:', error);
        toast.error('Failed to delete goal');
        return false;
      }

      toast.success('Goal deleted successfully');
      await fetchOverdueGoals();
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
      return false;
    }
  };

  // Auto-archive goals that are way past grace period
  const autoArchiveExpiredGoals = useCallback(async () => {
    if (!user) return;

    try {
      const { data: expiredGoals, error } = await supabase
        .from('study_goals')
        .select('id, title, end_date, grace_period_days')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('is_completed', false);

      if (error || !expiredGoals) return;

      const autoArchivePromises = expiredGoals
        .filter(goal => {
          const endDate = new Date(goal.end_date);
          const gracePeriodEnd = new Date(endDate.getTime() + (goal.grace_period_days * 24 * 60 * 60 * 1000));
          const autoArchiveDate = new Date(gracePeriodEnd.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days after grace period
          return new Date() > autoArchiveDate;
        })
        .map(goal => archiveGoal(goal.id, 'Automatically archived due to extended overdue period'));

      if (autoArchivePromises.length > 0) {
        await Promise.all(autoArchivePromises);
        console.log(`Auto-archived ${autoArchivePromises.length} expired goals`);
      }
    } catch (error) {
      console.error('Error auto-archiving expired goals:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOverdueGoals();
      autoArchiveExpiredGoals();
    }
  }, [user, fetchOverdueGoals, autoArchiveExpiredGoals]);

  const actions: OverdueGoalActions = {
    extendGoal,
    pauseGoal,
    archiveGoal,
    deleteGoal
  };

  return {
    overdueGoals,
    loading,
    actions,
    refetch: fetchOverdueGoals
  };
};

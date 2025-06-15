
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface StudyGoal {
  id: string;
  title: string;
  description?: string;
  target_hours: number;
  start_date: string;
  end_date: string;
  is_completed: boolean;
  progress: number;
  status: string;
  created_at: string;
  updated_at: string;
}

// Simplified goals hook
export const useSimplifiedGoals = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch goals with simple query
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['study-goals'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StudyGoal[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<StudyGoal, 'id' | 'created_at' | 'updated_at' | 'progress' | 'is_completed'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('study_goals')
        .insert({
          ...goalData,
          user_id: user.id,
          progress: 0,
          is_completed: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast.success('Goal created successfully');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StudyGoal> }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('study_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast.success('Goal updated successfully');
    },
    onError: (error) => {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('study_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast.success('Goal deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    },
  });

  return {
    // Data
    goals,
    isLoading,
    error,
    
    // Mutations
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    
    // Loading states
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  };
};

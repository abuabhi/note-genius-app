
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

  // Fetch goals with simple query
  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['study-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StudyGoal[];
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<StudyGoal, 'id' | 'created_at' | 'updated_at' | 'progress' | 'is_completed'>) => {
      const { data, error } = await supabase
        .from('study_goals')
        .insert({
          ...goalData,
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
      const { data, error } = await supabase
        .from('study_goals')
        .update(updates)
        .eq('id', id)
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
      const { error } = await supabase
        .from('study_goals')
        .delete()
        .eq('id', goalId);
      
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

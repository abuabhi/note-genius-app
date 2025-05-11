import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type StudyGoal = {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  target_hours: number;
  progress: number;
  is_completed: boolean;
  start_date: string;
  end_date: string;
  flashcard_set_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type GoalFormValues = Omit<StudyGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'progress' | 'is_completed'> & {
  id?: string;
};

export const useStudyGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('end_date', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching study goals:', error);
      toast.error('Failed to load study goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: GoalFormValues) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('study_goals')
        .insert({
          ...goalData,
          user_id: user.id,
          progress: 0,
          is_completed: false
        })
        .select()
        .single();

      if (error) throw error;
      
      setGoals((prev) => [...prev, data]);
      toast.success('Study goal created successfully');
      return data;
    } catch (error) {
      console.error('Error creating study goal:', error);
      toast.error('Failed to create study goal');
      return null;
    }
  };

  const updateGoal = async (id: string, goalData: Partial<GoalFormValues>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('study_goals')
        .update(goalData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals((prev) => 
        prev.map((goal) => 
          goal.id === id ? { ...goal, ...goalData } : goal
        )
      );
      
      toast.success('Study goal updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating study goal:', error);
      toast.error('Failed to update study goal');
      return false;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('study_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals((prev) => prev.filter((goal) => goal.id !== id));
      toast.success('Study goal deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting study goal:', error);
      toast.error('Failed to delete study goal');
      return false;
    }
  };

  const updateGoalProgress = async (id: string, progressHours: number) => {
    if (!user) return false;

    const goal = goals.find(g => g.id === id);
    if (!goal) return false;

    const newProgress = Math.min(100, Math.round((progressHours / goal.target_hours) * 100));
    const isCompleted = newProgress >= 100;

    try {
      const { error } = await supabase
        .from('study_goals')
        .update({ 
          progress: newProgress,
          is_completed: isCompleted 
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals((prev) => 
        prev.map((goal) => 
          goal.id === id ? { 
            ...goal, 
            progress: newProgress,
            is_completed: isCompleted 
          } : goal
        )
      );
      
      if (isCompleted) {
        toast.success('Congratulations! Study goal completed');
      } else {
        toast.success('Study goal progress updated');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast.error('Failed to update goal progress');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  return {
    goals,
    loading,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress
  };
};

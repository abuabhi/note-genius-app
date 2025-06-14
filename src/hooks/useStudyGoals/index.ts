
export type { StudyGoal, GoalFormValues } from '@/types/study';
export * from './goalOperations';
export * from './goalSuggestions';
export * from './goalTemplates';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { StudyGoal, GoalFormValues } from '@/types/study';
import { toast } from 'sonner';
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  createGoalFromTemplate,
  checkGoalAchievements
} from './goalOperations';
import { useGoalSuggestions } from './goalSuggestions';

export const useStudyGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    suggestions,
    dismissedSuggestions,
    setDismissedSuggestions,
    suggestionsEnabled,
    toggleSuggestions,
    refreshSuggestions
  } = useGoalSuggestions();

  // Filter goals to only show active and completed goals (not archived)
  const activeGoals = goals.filter(goal => 
    !goal.status || goal.status === 'active' || goal.status === 'completed'
  );

  const getStreakBonus = useCallback((): string | null => {
    const completedGoals = activeGoals.filter(goal => goal.is_completed);
    if (completedGoals.length >= 5) return '🔥 Goal Master!';
    if (completedGoals.length >= 3) return '⭐ On Fire!';
    if (completedGoals.length >= 1) return '🎯 Getting Started!';
    return null;
  }, [activeGoals]);

  const handleFetchGoals = useCallback(() => {
    fetchGoals(user, setGoals, setLoading);
  }, [user]);

  const handleCreateGoal = useCallback(async (goalData: GoalFormValues) => {
    await createGoal(user, goalData, setGoals, () => {
      toast.success('Goal created successfully!');
    });
  }, [user]);

  const handleUpdateGoal = useCallback(async (id: string, goalData: Partial<GoalFormValues>) => {
    await updateGoal(user, id, goalData, setGoals);
    toast.success('Goal updated successfully!');
  }, [user]);

  const handleDeleteGoal = useCallback(async (id: string): Promise<boolean> => {
    const success = await deleteGoal(user, id, setGoals);
    if (success) {
      toast.success('Goal deleted successfully!');
    } else {
      toast.error('Failed to delete goal');
    }
    return success;
  }, [user]);

  const handleCreateGoalFromTemplate = useCallback(async (template: any, customizations: any = {}) => {
    await createGoalFromTemplate(
      user, 
      template, 
      customizations, 
      setGoals, 
      setDismissedSuggestions,
      () => {
        toast.success(`Goal "${template.title}" created from template!`);
      }
    );
  }, [user, setDismissedSuggestions]);

  const dismissSuggestion = useCallback((templateTitle: string) => {
    setDismissedSuggestions(prev => {
      const updated = [...prev, templateTitle];
      localStorage.setItem('dismissedGoalSuggestions', JSON.stringify(updated));
      return updated;
    });
    toast.success('Suggestion dismissed');
  }, [setDismissedSuggestions]);

  const getGoalSuggestions = useCallback(() => {
    if (!suggestionsEnabled) return [];
    return suggestions.filter(suggestion => 
      !dismissedSuggestions.includes(suggestion.title)
    ).slice(0, 3);
  }, [suggestions, dismissedSuggestions, suggestionsEnabled]);

  useEffect(() => {
    handleFetchGoals();
  }, [handleFetchGoals]);

  useEffect(() => {
    if (user) {
      checkGoalAchievements(user);
    }
  }, [user, goals]);

  return {
    goals: activeGoals, // Return only active goals (excludes archived)
    loading,
    createGoal: handleCreateGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
    createGoalFromTemplate: handleCreateGoalFromTemplate,
    dismissSuggestion,
    getGoalSuggestions,
    getStreakBonus,
    suggestionsEnabled,
    toggleSuggestions,
    refreshSuggestions,
    refetch: handleFetchGoals
  };
};

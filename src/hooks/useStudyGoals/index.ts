
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { StudyGoal, GoalFormValues, GoalTemplate } from './types';
import { goalTemplates } from './templates';
import { getGoalSuggestions, getStreakBonus } from './suggestionUtils';
import { 
  fetchGoals, 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  checkGoalAchievements, 
  createGoalFromTemplate 
} from './goalOperations';

export * from './types';
export { goalTemplates } from './templates';

export const useStudyGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);

  const handleFetchGoals = () => fetchGoals(user, setGoals, setLoading);
  
  const handleCreateGoal = (goalData: GoalFormValues) => 
    createGoal(user, goalData, setGoals, () => checkGoalAchievements(user));
  
  const handleUpdateGoal = (id: string, goalData: Partial<GoalFormValues>) =>
    updateGoal(user, id, goalData, setGoals);
  
  const handleDeleteGoal = (id: string) =>
    deleteGoal(user, id, setGoals);

  const handleCreateGoalFromTemplate = (template: GoalTemplate, customizations?: Partial<GoalFormValues>) =>
    createGoalFromTemplate(user, template, customizations, setGoals, setDismissedSuggestions, () => checkGoalAchievements(user));

  const dismissSuggestion = (templateTitle: string) => {
    setDismissedSuggestions(prev => [...prev, templateTitle]);
    toast.success('Suggestion dismissed');
  };

  const toggleSuggestions = () => {
    setSuggestionsEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('goalSuggestionsEnabled', newValue.toString());
      toast.success(newValue ? 'Goal suggestions enabled' : 'Goal suggestions disabled');
      return newValue;
    });
  };

  const refreshSuggestions = () => {
    setDismissedSuggestions([]);
    toast.success('Suggestions refreshed');
  };

  const handleGetGoalSuggestions = () => 
    getGoalSuggestions(goals, dismissedSuggestions, suggestionsEnabled, setDismissedSuggestions);

  const handleGetStreakBonus = () => getStreakBonus(goals);

  useEffect(() => {
    if (user) {
      handleFetchGoals();
      // Load suggestions preference from localStorage
      const savedPreference = localStorage.getItem('goalSuggestionsEnabled');
      if (savedPreference !== null) {
        setSuggestionsEnabled(savedPreference === 'true');
      }
    }
  }, [user]);

  return {
    goals,
    loading,
    fetchGoals: handleFetchGoals,
    createGoal: handleCreateGoal,
    updateGoal: handleUpdateGoal,
    deleteGoal: handleDeleteGoal,
    createGoalFromTemplate: handleCreateGoalFromTemplate,
    dismissSuggestion,
    getGoalSuggestions: handleGetGoalSuggestions,
    getStreakBonus: handleGetStreakBonus,
    goalTemplates,
    suggestionsEnabled,
    toggleSuggestions,
    refreshSuggestions
  };
};

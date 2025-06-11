
import { StudyGoal, GoalTemplate } from './types';
import { goalTemplates } from './templates';

export const selectBestSuggestions = (
  availableTemplates: GoalTemplate[], 
  userLevel: 'beginner' | 'intermediate' | 'advanced', 
  count: number
): GoalTemplate[] => {
  // Prioritize templates based on user level
  const priorityTemplates = availableTemplates.filter(t => t.difficulty_level === userLevel);
  const otherTemplates = availableTemplates.filter(t => t.difficulty_level !== userLevel);
  
  // Combine prioritized templates with others
  const orderedTemplates = [...priorityTemplates, ...otherTemplates];
  
  // Return the requested count
  return orderedTemplates.slice(0, count);
};

export const getGoalSuggestions = (
  goals: StudyGoal[],
  dismissedSuggestions: string[],
  suggestionsEnabled: boolean,
  setDismissedSuggestions: (fn: (prev: string[]) => string[]) => void
): GoalTemplate[] => {
  if (!suggestionsEnabled) return [];

  const completedGoalsCount = goals.filter(g => g.is_completed).length;
  const currentActiveGoals = goals.filter(g => !g.is_completed).length;
  const existingGoalTitles = new Set(goals.map(g => g.title));
  
  // Don't suggest if user has too many active goals
  if (currentActiveGoals >= 5) {
    return [];
  }

  // Determine user level based on completed goals
  let userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (completedGoalsCount >= 5) {
    userLevel = 'advanced';
  } else if (completedGoalsCount >= 2) {
    userLevel = 'intermediate';
  }

  // Get available templates
  const availableTemplates = goalTemplates.filter(template => 
    !existingGoalTitles.has(template.title) && 
    !dismissedSuggestions.includes(template.title)
  );

  // If we have less than 3 available templates, reset some dismissed ones
  if (availableTemplates.length < 3 && dismissedSuggestions.length > 0) {
    const oldestDismissed = dismissedSuggestions.slice(0, Math.min(5, dismissedSuggestions.length));
    setDismissedSuggestions(prev => prev.filter(title => !oldestDismissed.includes(title)));
    
    // Recalculate available templates
    const refreshedTemplates = goalTemplates.filter(template => 
      !existingGoalTitles.has(template.title) && 
      !dismissedSuggestions.filter(title => !oldestDismissed.includes(title)).includes(template.title)
    );
    
    return selectBestSuggestions(refreshedTemplates, userLevel, 3);
  }

  return selectBestSuggestions(availableTemplates, userLevel, 3);
};

export const getStreakBonus = (goals: StudyGoal[]): number => {
  // This would calculate streak bonus based on consecutive goal completions
  const recentCompletions = goals
    .filter(g => g.is_completed)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 7);
  
  return recentCompletions.length;
};

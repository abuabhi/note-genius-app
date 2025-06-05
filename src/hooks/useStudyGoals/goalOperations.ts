
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StudyGoal, GoalFormValues, GoalTemplate } from './types';

export const fetchGoals = async (user: any, setGoals: (goals: StudyGoal[]) => void, setLoading: (loading: boolean) => void) => {
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

export const createGoal = async (
  user: any, 
  goalData: GoalFormValues, 
  setGoals: (fn: (prev: StudyGoal[]) => StudyGoal[]) => void,
  checkGoalAchievements: () => Promise<void>
): Promise<StudyGoal | null> => {
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
    toast.success('🎯 Study goal created successfully! Progress will be tracked automatically!');
    
    // Trigger achievement check
    await checkGoalAchievements();
    
    return data;
  } catch (error) {
    console.error('Error creating study goal:', error);
    toast.error('Failed to create study goal');
    return null;
  }
};

export const updateGoal = async (
  user: any,
  id: string, 
  goalData: Partial<GoalFormValues>,
  setGoals: (fn: (prev: StudyGoal[]) => StudyGoal[]) => void
): Promise<boolean> => {
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

export const deleteGoal = async (
  user: any,
  id: string,
  setGoals: (fn: (prev: StudyGoal[]) => StudyGoal[]) => void
): Promise<boolean> => {
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

export const checkGoalAchievements = async (user: any): Promise<void> => {
  if (!user) return;

  try {
    // This would trigger the achievement system
    const { data, error } = await supabase.rpc('check_and_award_achievements', {
      p_user_id: user.id
    });

    if (error) {
      console.error('Error checking achievements:', error);
      return;
    }

    // Show achievement notifications
    if (data && data.length > 0) {
      data.forEach((achievement: { new_achievement_title: string }) => {
        toast.success(`🏆 Achievement Unlocked: ${achievement.new_achievement_title}!`);
      });
    }
  } catch (error) {
    console.error('Error checking goal achievements:', error);
  }
};

export const createGoalFromTemplate = async (
  user: any,
  template: GoalTemplate, 
  customizations: Partial<GoalFormValues> = {},
  setGoals: (fn: (prev: StudyGoal[]) => StudyGoal[]) => void,
  setDismissedSuggestions: (fn: (prev: string[]) => string[]) => void,
  checkGoalAchievements: () => Promise<void>
): Promise<StudyGoal | null> => {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + template.duration_days);

  const goalData: GoalFormValues = {
    title: template.title,
    description: template.description,
    target_hours: template.target_hours,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    subject: template.subject || null,
    flashcard_set_id: null,
    ...customizations
  };

  const result = await createGoal(user, goalData, setGoals, checkGoalAchievements);
  
  // Add the template title to dismissed suggestions to remove it from the list
  if (result) {
    setDismissedSuggestions(prev => [...prev, template.title]);
  }
  
  return result;
};

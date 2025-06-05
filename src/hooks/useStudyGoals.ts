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

export type GoalTemplate = {
  title: string;
  description: string;
  target_hours: number;
  duration_days: number;
  category: 'beginner' | 'intermediate' | 'advanced';
  subject?: string;
};

export const goalTemplates: GoalTemplate[] = [
  {
    title: "Daily Study Habit",
    description: "Study for 1 hour every day this week",
    target_hours: 7,
    duration_days: 7,
    category: 'beginner'
  },
  {
    title: "Master a Subject",
    description: "Complete 20 hours of focused study on a specific subject",
    target_hours: 20,
    duration_days: 30,
    category: 'intermediate'
  },
  {
    title: "Exam Preparation Sprint",
    description: "Intensive 40-hour study program for exam preparation",
    target_hours: 40,
    duration_days: 14,
    category: 'advanced'
  },
  {
    title: "Weekend Warrior",
    description: "Study 5 hours over the weekend",
    target_hours: 5,
    duration_days: 2,
    category: 'beginner'
  },
  {
    title: "Monthly Challenge",
    description: "Achieve 50 hours of study this month",
    target_hours: 50,
    duration_days: 30,
    category: 'advanced'
  },
  {
    title: "Quick Study Session",
    description: "Complete 3 focused study sessions of 2 hours each",
    target_hours: 6,
    duration_days: 7,
    category: 'beginner'
  }
];

export const useStudyGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const queryClient = useQueryClient();

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
      toast.success('🎯 Study goal created successfully! Let\'s achieve it together!');
      
      // Trigger achievement check
      await checkGoalAchievements();
      
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
        toast.success('🎉 Congratulations! Goal completed! You\'re amazing!');
        await checkGoalAchievements();
      } else if (newProgress >= 50 && goal.progress < 50) {
        toast.success('🔥 You\'re halfway there! Keep up the great work!');
      } else if (newProgress >= 75 && goal.progress < 75) {
        toast.success('⭐ Almost there! You\'re in the final stretch!');
      } else {
        toast.success('📈 Goal progress updated - you\'re doing great!');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      toast.error('Failed to update goal progress');
      return false;
    }
  };

  const checkGoalAchievements = async () => {
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

  const createGoalFromTemplate = async (template: GoalTemplate, customizations?: Partial<GoalFormValues>) => {
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

    const result = await createGoal(goalData);
    
    // Add the template title to dismissed suggestions to remove it from the list
    if (result) {
      setDismissedSuggestions(prev => [...prev, template.title]);
    }
    
    return result;
  };

  const dismissSuggestion = (templateTitle: string) => {
    setDismissedSuggestions(prev => [...prev, templateTitle]);
    toast.success('Suggestion dismissed');
  };

  const getGoalSuggestions = () => {
    const completedGoalsCount = goals.filter(g => g.is_completed).length;
    const currentActiveGoals = goals.filter(g => !g.is_completed).length;
    const existingGoalTitles = new Set(goals.map(g => g.title));
    
    if (currentActiveGoals >= 3) {
      return [];
    }

    let suggestedTemplates: GoalTemplate[] = [];
    
    if (completedGoalsCount === 0) {
      suggestedTemplates = goalTemplates.filter(t => t.category === 'beginner');
    } else if (completedGoalsCount < 3) {
      suggestedTemplates = goalTemplates.filter(t => t.category === 'intermediate');
    } else {
      suggestedTemplates = goalTemplates.filter(t => t.category === 'advanced');
    }

    // Filter out templates that are already created as goals or dismissed
    return suggestedTemplates.filter(template => 
      !existingGoalTitles.has(template.title) && 
      !dismissedSuggestions.includes(template.title)
    );
  };

  const getStreakBonus = () => {
    // This would calculate streak bonus based on consecutive goal completions
    const recentCompletions = goals
      .filter(g => g.is_completed)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 7);
    
    return recentCompletions.length;
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
    updateGoalProgress,
    createGoalFromTemplate,
    dismissSuggestion,
    getGoalSuggestions,
    getStreakBonus,
    goalTemplates
  };
};

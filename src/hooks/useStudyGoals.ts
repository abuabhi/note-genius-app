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
  },
  {
    title: "Morning Study Routine",
    description: "Study for 30 minutes every morning for 2 weeks",
    target_hours: 7,
    duration_days: 14,
    category: 'beginner'
  },
  {
    title: "Deep Dive Learning",
    description: "Dedicate 15 hours to mastering one challenging topic",
    target_hours: 15,
    duration_days: 21,
    category: 'intermediate'
  },
  {
    title: "Study Streak Builder",
    description: "Study at least 1 hour daily for 10 consecutive days",
    target_hours: 10,
    duration_days: 10,
    category: 'intermediate'
  },
  {
    title: "Power Study Week",
    description: "Complete 25 hours of intensive study in one week",
    target_hours: 25,
    duration_days: 7,
    category: 'advanced'
  },
  {
    title: "Subject Mastery Path",
    description: "Achieve 35 hours in your most challenging subject",
    target_hours: 35,
    duration_days: 45,
    category: 'advanced'
  },
  {
    title: "Evening Study Block",
    description: "Study 2 hours every evening for 5 days",
    target_hours: 10,
    duration_days: 5,
    category: 'intermediate'
  },
  {
    title: "Mini Marathon",
    description: "Complete 4 hours of focused study in one day",
    target_hours: 4,
    duration_days: 1,
    category: 'beginner'
  },
  {
    title: "Consistency Builder",
    description: "Study 45 minutes daily for 3 weeks",
    target_hours: 16,
    duration_days: 21,
    category: 'intermediate'
  },
  {
    title: "Study Champion",
    description: "Achieve 60 hours of study over 2 months",
    target_hours: 60,
    duration_days: 60,
    category: 'advanced'
  },
  {
    title: "Lunch Break Learning",
    description: "Use lunch breaks for study - 30 min daily for 10 days",
    target_hours: 5,
    duration_days: 10,
    category: 'beginner'
  },
  {
    title: "Review & Refresh",
    description: "Spend 12 hours reviewing previous materials",
    target_hours: 12,
    duration_days: 14,
    category: 'intermediate'
  },
  {
    title: "Focus Intensive",
    description: "Complete 30 hours of distraction-free study",
    target_hours: 30,
    duration_days: 20,
    category: 'advanced'
  }
];

export const useStudyGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(true);
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

  const getGoalSuggestions = () => {
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

  const selectBestSuggestions = (
    availableTemplates: GoalTemplate[], 
    userLevel: 'beginner' | 'intermediate' | 'advanced', 
    count: number
  ): GoalTemplate[] => {
    // Prioritize templates based on user level
    const priorityTemplates = availableTemplates.filter(t => t.category === userLevel);
    const otherTemplates = availableTemplates.filter(t => t.category !== userLevel);
    
    // Combine prioritized templates with others
    const orderedTemplates = [...priorityTemplates, ...otherTemplates];
    
    // Return the requested count
    return orderedTemplates.slice(0, count);
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
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    createGoalFromTemplate,
    dismissSuggestion,
    getGoalSuggestions,
    getStreakBonus,
    goalTemplates,
    suggestionsEnabled,
    toggleSuggestions,
    refreshSuggestions
  };
};

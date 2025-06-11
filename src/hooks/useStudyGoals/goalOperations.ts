
import { supabase } from '@/integrations/supabase/client';
import { StudyGoal, GoalFormValues } from '@/types/study';

export const fetchStudyGoals = async (userId: string): Promise<StudyGoal[]> => {
  console.log('Fetching study goals for user:', userId);
  
  const { data, error } = await supabase
    .from('study_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching study goals:', error);
    throw error;
  }

  // Transform the data to match StudyGoal type
  return data.map(goal => ({
    ...goal,
    subject: goal.academic_subject || 'General'
  })) as StudyGoal[];
};

export const createStudyGoal = async (goalData: Omit<StudyGoal, 'id' | 'created_at' | 'updated_at'>): Promise<StudyGoal> => {
  console.log('Creating study goal:', goalData);
  
  const { data, error } = await supabase
    .from('study_goals')
    .insert({
      user_id: goalData.user_id,
      title: goalData.title,
      description: goalData.description,
      target_hours: goalData.target_hours,
      start_date: goalData.start_date,
      end_date: goalData.end_date,
      flashcard_set_id: goalData.flashcard_set_id,
      is_completed: goalData.is_completed,
      progress: goalData.progress,
      academic_subject: goalData.subject
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating study goal:', error);
    throw error;
  }

  return {
    ...data,
    subject: data.academic_subject || 'General'
  } as StudyGoal;
};

export const updateStudyGoal = async (id: string, updates: Partial<StudyGoal>): Promise<StudyGoal> => {
  console.log('Updating study goal:', id, updates);
  
  const updateData: any = { ...updates };
  if (updates.subject) {
    updateData.academic_subject = updates.subject;
    delete updateData.subject;
  }
  
  const { data, error } = await supabase
    .from('study_goals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating study goal:', error);
    throw error;
  }

  return {
    ...data,
    subject: data.academic_subject || 'General'
  } as StudyGoal;
};

export const deleteStudyGoal = async (id: string): Promise<boolean> => {
  console.log('Deleting study goal:', id);
  
  const { error } = await supabase
    .from('study_goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting study goal:', error);
    throw error;
  }

  return true;
};

export const fetchGoals = async (user: any, setGoals: any, setLoading: any) => {
  if (!user) return;
  
  try {
    const goals = await fetchStudyGoals(user.id);
    setGoals(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
  } finally {
    setLoading(false);
  }
};

export const createGoal = async (user: any, goalData: GoalFormValues, setGoals: any, onSuccess?: () => void) => {
  if (!user) return;
  
  try {
    const newGoal = await createStudyGoal({
      user_id: user.id,
      title: goalData.title,
      description: goalData.description,
      target_hours: goalData.target_hours,
      start_date: goalData.start_date,
      end_date: goalData.end_date,
      subject: goalData.subject,
      flashcard_set_id: goalData.flashcard_set_id,
      is_completed: false,
      progress: 0
    });
    
    setGoals((prev: StudyGoal[]) => [newGoal, ...prev]);
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error creating goal:', error);
  }
};

export const updateGoal = async (user: any, id: string, goalData: Partial<GoalFormValues>, setGoals: any) => {
  if (!user) return;
  
  try {
    const updatedGoal = await updateStudyGoal(id, goalData);
    setGoals((prev: StudyGoal[]) => 
      prev.map(goal => goal.id === id ? updatedGoal : goal)
    );
  } catch (error) {
    console.error('Error updating goal:', error);
  }
};

export const deleteGoal = async (user: any, id: string, setGoals: any): Promise<boolean> => {
  if (!user) return false;
  
  try {
    const success = await deleteStudyGoal(id);
    if (success) {
      setGoals((prev: StudyGoal[]) => prev.filter(goal => goal.id !== id));
    }
    return success;
  } catch (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
};

export const checkGoalAchievements = async (user: any) => {
  // Implementation for checking goal achievements
  console.log('Checking goal achievements for user:', user?.id);
};

export const createGoalFromTemplate = async (
  user: any, 
  template: any, 
  customizations: any, 
  setGoals: any, 
  setDismissedSuggestions: any, 
  onSuccess?: () => void
) => {
  if (!user) return;
  
  const goalData = {
    title: template.title,
    description: template.description,
    target_hours: template.target_hours,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + template.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subject: template.subject || 'General',
    ...customizations
  };
  
  await createGoal(user, goalData, setGoals, onSuccess);
  setDismissedSuggestions((prev: string[]) => [...prev, template.title]);
};

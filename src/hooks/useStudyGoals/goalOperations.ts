
import { supabase } from '@/integrations/supabase/client';
import { StudyGoal } from '@/types/study';

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
      ...goalData,
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
  
  const updateData = { ...updates };
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

export const deleteStudyGoal = async (id: string): Promise<void> => {
  console.log('Deleting study goal:', id);
  
  const { error } = await supabase
    .from('study_goals')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting study goal:', error);
    throw error;
  }
};


import { useCallback } from 'react';
import { UserSubject } from '@/types/flashcard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook that provides user subject-related operations for flashcards
 */
export const useUserSubjectOperations = (
  userSubjects: UserSubject[], 
  setUserSubjects: React.Dispatch<React.SetStateAction<UserSubject[]>>
) => {
  
  const fetchUserSubjects = useCallback(async (): Promise<UserSubject[]> => {
    try {
      const { data, error } = await supabase
        .from('user_subjects')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setUserSubjects(data);
      return data;
    } catch (error) {
      console.error('fetchUserSubjects: Error fetching user subjects:', error);
      toast.error('Failed to load user subjects');
      return [];
    }
  }, [setUserSubjects]);

  const createUserSubject = useCallback(async (name: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('user_subjects')
        .insert({
          name,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setUserSubjects(prev => [...prev, data]);
      toast.success('Subject created successfully');
    } catch (error) {
      console.error('createUserSubject: Error creating user subject:', error);
      toast.error('Failed to create subject');
    }
  }, [setUserSubjects]);

  const updateUserSubject = useCallback(async (id: string, name: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('user_subjects')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setUserSubjects(prev => 
        prev.map(subject => subject.id === id ? { ...subject, name } : subject)
      );
      toast.success('Subject updated successfully');
    } catch (error) {
      console.error('updateUserSubject: Error updating user subject:', error);
      toast.error('Failed to update subject');
    }
  }, [setUserSubjects]);

  const deleteUserSubject = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('user_subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUserSubjects(prev => prev.filter(subject => subject.id !== id));
      toast.success('Subject deleted successfully');
    } catch (error) {
      console.error('deleteUserSubject: Error deleting user subject:', error);
      toast.error('Failed to delete subject');
    }
  }, [setUserSubjects]);

  return {
    fetchUserSubjects,
    createUserSubject,
    updateUserSubject,
    deleteUserSubject
  };
};

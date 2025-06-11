
import { useCallback } from 'react';
import { AcademicSubject } from '@/types/flashcard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook that provides academic subject-related operations for flashcards
 */
export const useAcademicSubjectOperations = (
  academicSubjects: AcademicSubject[], 
  setAcademicSubjects: React.Dispatch<React.SetStateAction<AcademicSubject[]>>
) => {
  
  const fetchAcademicSubjects = useCallback(async (): Promise<AcademicSubject[]> => {
    try {
      const { data, error } = await supabase
        .from('academic_subjects')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setAcademicSubjects(data);
      return data;
    } catch (error) {
      console.error('fetchAcademicSubjects: Error fetching academic subjects:', error);
      toast.error('Failed to load academic subjects');
      return [];
    }
  }, [setAcademicSubjects]);

  const createAcademicSubject = useCallback(async (name: string, parentId?: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('academic_subjects')
        .insert({
          name,
          parent_id: parentId
        })
        .select()
        .single();

      if (error) throw error;

      setAcademicSubjects(prev => [...prev, data]);
      toast.success('Academic subject created successfully');
    } catch (error) {
      console.error('createAcademicSubject: Error creating academic subject:', error);
      toast.error('Failed to create academic subject');
    }
  }, [setAcademicSubjects]);

  const updateAcademicSubject = useCallback(async (id: string, name: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('academic_subjects')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setAcademicSubjects(prev => 
        prev.map(subject => subject.id === id ? { ...subject, name } : subject)
      );
      toast.success('Academic subject updated successfully');
    } catch (error) {
      console.error('updateAcademicSubject: Error updating academic subject:', error);
      toast.error('Failed to update academic subject');
    }
  }, [setAcademicSubjects]);

  const deleteAcademicSubject = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('academic_subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAcademicSubjects(prev => prev.filter(subject => subject.id !== id));
      toast.success('Academic subject deleted successfully');
    } catch (error) {
      console.error('deleteAcademicSubject: Error deleting academic subject:', error);
      toast.error('Failed to delete academic subject');
    }
  }, [setAcademicSubjects]);

  return {
    fetchAcademicSubjects,
    createAcademicSubject,
    updateAcademicSubject,
    deleteAcademicSubject
  };
};

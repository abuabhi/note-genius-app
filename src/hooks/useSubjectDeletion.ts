
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DeletionResult {
  success: boolean;
  deletedCounts: {
    flashcards: number;
    sets: number;
    notes: number;
    goals: number;
  };
  errors: string[];
}

export const useSubjectDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkDependencies = async (subjectName: string) => {
    setIsChecking(true);
    try {
      const dependencies = {
        flashcards: 0,
        sets: 0,
        notes: 0,
        goals: 0
      };

      // Check notes
      const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('subject', subjectName);

      dependencies.notes = notesCount || 0;

      // Check flashcard sets
      const { count: setsCount } = await supabase
        .from('flashcard_sets')
        .select('*', { count: 'exact', head: true })
        .eq('subject', subjectName);

      dependencies.sets = setsCount || 0;

      // Check study goals
      const { count: goalsCount } = await supabase
        .from('study_goals')
        .select('*', { count: 'exact', head: true })
        .eq('academic_subject', subjectName);

      dependencies.goals = goalsCount || 0;

      return dependencies;
    } catch (error) {
      console.error('Error checking dependencies:', error);
      throw error;
    } finally {
      setIsChecking(false);
    }
  };

  const deleteSubject = async (subjectId: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('user_subjects')
        .delete()
        .eq('id', subjectId);

      if (error) {
        console.error('Error deleting subject:', error);
        toast.error('Failed to delete subject');
        return false;
      }

      toast.success('Subject deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteSubjectWithDependencies = async (subjectId: string): Promise<DeletionResult> => {
    setIsDeleting(true);
    
    const result: DeletionResult = {
      success: false,
      deletedCounts: {
        flashcards: 0,
        sets: 0,
        notes: 0,
        goals: 0
      },
      errors: []
    };

    try {
      console.log('Starting deletion process for subject:', subjectId);

      // Get the subject name first
      const { data: subjectData } = await supabase
        .from('user_subjects')
        .select('name')
        .eq('id', subjectId)
        .single();

      if (!subjectData) {
        result.errors.push('Subject not found');
        return result;
      }

      const subjectName = subjectData.name;

      // Delete notes
      const { count: deletedNotes, error: notesError } = await supabase
        .from('notes')
        .delete({ count: 'exact' })
        .eq('subject', subjectName);

      if (notesError) {
        result.errors.push(`Error deleting notes: ${notesError.message}`);
      } else {
        result.deletedCounts.notes = deletedNotes || 0;
      }

      // Delete flashcard sets
      const { count: deletedSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .delete({ count: 'exact' })
        .eq('subject', subjectName);

      if (setsError) {
        result.errors.push(`Error deleting flashcard sets: ${setsError.message}`);
      } else {
        result.deletedCounts.sets = deletedSets || 0;
      }

      // Update study goals to remove subject reference
      const { count: updatedGoals, error: goalsError } = await supabase
        .from('study_goals')
        .update({ academic_subject: null })
        .eq('academic_subject', subjectName);

      if (goalsError) {
        result.errors.push(`Error updating study goals: ${goalsError.message}`);
      } else {
        result.deletedCounts.goals = updatedGoals || 0;
      }

      // Finally, delete the subject itself
      const { error: subjectError } = await supabase
        .from('user_subjects')
        .delete()
        .eq('id', subjectId);

      if (subjectError) {
        result.errors.push(`Error deleting subject: ${subjectError.message}`);
      }

      result.success = result.errors.length === 0;

      if (result.success) {
        toast.success('Subject and all related data deleted successfully');
      } else {
        toast.error('Some errors occurred during deletion');
      }

      return result;

    } catch (error) {
      console.error('Unexpected error during deletion:', error);
      result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
      toast.error('Failed to delete subject');
      return result;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteSubjectWithDependencies,
    checkDependencies,
    deleteSubject,
    isDeleting,
    isChecking
  };
};

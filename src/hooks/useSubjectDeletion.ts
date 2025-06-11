
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

      // Delete flashcard progress first (has foreign key references)
      const { error: progressError } = await supabase
        .from('user_flashcard_progress')
        .delete()
        .in('flashcard_id', 
          supabase
            .from('flashcard_set_cards')
            .select('flashcard_id')
            .in('set_id',
              supabase
                .from('flashcard_sets')
                .select('id')
                .eq('subject_id', subjectId)
            )
        );

      if (progressError) {
        result.errors.push(`Error deleting flashcard progress: ${progressError.message}`);
      }

      // Delete flashcard set cards
      const { error: setCardsError } = await supabase
        .from('flashcard_set_cards')
        .delete()
        .in('set_id',
          supabase
            .from('flashcard_sets')
            .select('id')
            .eq('subject_id', subjectId)
        );

      if (setCardsError) {
        result.errors.push(`Error deleting flashcard set cards: ${setCardsError.message}`);
      }

      // Delete flashcards
      const { data: flashcardsToDelete } = await supabase
        .from('flashcard_set_cards')
        .select('flashcard_id')
        .in('set_id',
          supabase
            .from('flashcard_sets')
            .select('id')
            .eq('subject_id', subjectId)
        );

      if (flashcardsToDelete) {
        const flashcardIds = flashcardsToDelete.map(f => f.flashcard_id);
        if (flashcardIds.length > 0) {
          const { count: deletedFlashcards, error: flashcardsError } = await supabase
            .from('flashcards')
            .delete({ count: 'exact' })
            .in('id', flashcardIds);

          if (flashcardsError) {
            result.errors.push(`Error deleting flashcards: ${flashcardsError.message}`);
          } else {
            result.deletedCounts.flashcards = deletedFlashcards || 0;
          }
        }
      }

      // Delete flashcard sets
      const { count: deletedSets, error: setsError } = await supabase
        .from('flashcard_sets')
        .delete({ count: 'exact' })
        .eq('subject_id', subjectId);

      if (setsError) {
        result.errors.push(`Error deleting flashcard sets: ${setsError.message}`);
      } else {
        result.deletedCounts.sets = deletedSets || 0;
      }

      // Delete notes
      const { count: deletedNotes, error: notesError } = await supabase
        .from('notes')
        .delete({ count: 'exact' })
        .eq('subject_id', subjectId);

      if (notesError) {
        result.errors.push(`Error deleting notes: ${notesError.message}`);
      } else {
        result.deletedCounts.notes = deletedNotes || 0;
      }

      // Delete study goals
      const { count: deletedGoals, error: goalsError } = await supabase
        .from('study_goals')
        .update({ academic_subject: null })
        .eq('academic_subject', subjectId);

      if (goalsError) {
        result.errors.push(`Error updating study goals: ${goalsError.message}`);
      } else {
        result.deletedCounts.goals = deletedGoals || 0;
      }

      // Finally, delete the subject itself
      const { error: subjectError } = await supabase
        .from('academic_subjects')
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
    isDeleting
  };
};


import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface SubjectDependencies {
  notes: number;
  flashcardSets: number;
  studyGoals: number;
  events: number;
  studySessions: number;
}

export const useSubjectDeletion = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = useState(false);

  const checkDependencies = async (subjectName: string): Promise<SubjectDependencies> => {
    if (!user) throw new Error("User not authenticated");

    setIsChecking(true);
    try {
      const [notesResult, flashcardSetsResult, studyGoalsResult, eventsResult, studySessionsResult] = await Promise.all([
        supabase
          .from('notes')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('subject', subjectName),
        
        supabase
          .from('flashcard_sets')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('subject', subjectName),
        
        supabase
          .from('study_goals')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('subject', subjectName),
        
        supabase
          .from('events')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .ilike('title', `%${subjectName}%`),
        
        supabase
          .from('study_sessions')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('subject', subjectName)
      ]);

      return {
        notes: notesResult.count || 0,
        flashcardSets: flashcardSetsResult.count || 0,
        studyGoals: studyGoalsResult.count || 0,
        events: eventsResult.count || 0,
        studySessions: studySessionsResult.count || 0
      };
    } finally {
      setIsChecking(false);
    }
  };

  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      console.log('Starting deletion process for subject ID:', subjectId);
      
      try {
        // First, get the subject name
        const { data: subjectData, error: fetchError } = await supabase
          .from("user_subjects")
          .select("name")
          .eq("id", subjectId)
          .eq("user_id", user.id)
          .single();
          
        if (fetchError) {
          console.error('Error fetching subject:', fetchError);
          throw new Error(`Failed to fetch subject: ${fetchError.message}`);
        }
        
        if (!subjectData) {
          throw new Error("Subject not found");
        }
        
        const subjectName = subjectData.name;
        console.log('Subject to delete:', subjectName);
        
        // Check if this is a foreign key constraint issue by looking at notes table
        const { data: linkedNotes, error: notesCheckError } = await supabase
          .from('notes')
          .select('id, subject_id')
          .eq('user_id', user.id)
          .eq('subject_id', subjectId);
          
        if (notesCheckError) {
          console.error('Error checking notes with subject_id:', notesCheckError);
        } else {
          console.log('Notes linked by subject_id:', linkedNotes);
        }
        
        // Update notes that reference this subject by name
        console.log('Updating notes with subject name:', subjectName);
        const { error: notesNameError } = await supabase
          .from('notes')
          .update({ subject: 'Uncategorized' })
          .eq('user_id', user.id)
          .eq('subject', subjectName);
          
        if (notesNameError) {
          console.error('Error updating notes by subject name:', notesNameError);
          throw new Error(`Failed to update notes: ${notesNameError.message}`);
        }
        
        // Update notes that reference this subject by ID
        if (linkedNotes && linkedNotes.length > 0) {
          console.log('Updating notes with subject_id:', subjectId);
          const { error: notesIdError } = await supabase
            .from('notes')
            .update({ subject_id: null, subject: 'Uncategorized' })
            .eq('user_id', user.id)
            .eq('subject_id', subjectId);
            
          if (notesIdError) {
            console.error('Error updating notes by subject_id:', notesIdError);
            throw new Error(`Failed to update notes by ID: ${notesIdError.message}`);
          }
        }
        
        // Update flashcard sets
        console.log('Updating flashcard sets...');
        const { error: flashcardError } = await supabase
          .from('flashcard_sets')
          .update({ subject: 'Uncategorized' })
          .eq('user_id', user.id)
          .eq('subject', subjectName);
          
        if (flashcardError) {
          console.error('Error updating flashcard sets:', flashcardError);
          throw new Error(`Failed to update flashcard sets: ${flashcardError.message}`);
        }
        
        // Update study goals
        console.log('Updating study goals...');
        const { error: goalsError } = await supabase
          .from('study_goals')
          .update({ subject: 'Uncategorized' })
          .eq('user_id', user.id)
          .eq('subject', subjectName);
          
        if (goalsError) {
          console.error('Error updating study goals:', goalsError);
          throw new Error(`Failed to update study goals: ${goalsError.message}`);
        }
        
        // Update study sessions
        console.log('Updating study sessions...');
        const { error: sessionsError } = await supabase
          .from('study_sessions')
          .update({ subject: 'Uncategorized' })
          .eq('user_id', user.id)
          .eq('subject', subjectName);
          
        if (sessionsError) {
          console.error('Error updating study sessions:', sessionsError);
          throw new Error(`Failed to update study sessions: ${sessionsError.message}`);
        }
        
        // Now try to delete the subject
        console.log('Attempting to delete subject from user_subjects...');
        const { error: deleteError } = await supabase
          .from("user_subjects")
          .delete()
          .eq("id", subjectId)
          .eq("user_id", user.id);
          
        if (deleteError) {
          console.error('Error deleting subject:', deleteError);
          throw new Error(`Failed to delete subject: ${deleteError.message}`);
        }
        
        console.log('Subject deleted successfully');
        
      } catch (error) {
        console.error('Full error details:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubjects"] });
      toast.success("Subject deleted successfully");
    },
    onError: (error) => {
      console.error("Delete subject mutation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete subject";
      toast.error(errorMessage);
    }
  });

  const deleteSubject = async (subjectId: string): Promise<boolean> => {
    try {
      await deleteSubjectMutation.mutateAsync(subjectId);
      return true;
    } catch (error) {
      console.error('Delete subject failed:', error);
      return false;
    }
  };

  return {
    checkDependencies,
    deleteSubject,
    isChecking,
    isDeleting: deleteSubjectMutation.isPending
  };
};

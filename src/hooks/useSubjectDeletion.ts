
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
      
      console.log('Deleting subject with ID:', subjectId);
      
      // First, get the subject name to check for dependencies
      const { data: subjectData, error: fetchError } = await supabase
        .from("user_subjects")
        .select("name")
        .eq("id", subjectId)
        .eq("user_id", user.id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching subject:', fetchError);
        throw fetchError;
      }
      
      if (!subjectData) {
        throw new Error("Subject not found");
      }
      
      const subjectName = subjectData.name;
      console.log('Subject name to delete:', subjectName);
      
      // Update all notes that reference this subject to use "Uncategorized"
      const { error: notesError } = await supabase
        .from('notes')
        .update({ subject: 'Uncategorized' })
        .eq('user_id', user.id)
        .eq('subject', subjectName);
        
      if (notesError) {
        console.error('Error updating notes:', notesError);
        throw notesError;
      }
      
      // Update all flashcard sets that reference this subject
      const { error: flashcardError } = await supabase
        .from('flashcard_sets')
        .update({ subject: 'Uncategorized' })
        .eq('user_id', user.id)
        .eq('subject', subjectName);
        
      if (flashcardError) {
        console.error('Error updating flashcard sets:', flashcardError);
        throw flashcardError;
      }
      
      // Update all study goals that reference this subject
      const { error: goalsError } = await supabase
        .from('study_goals')
        .update({ subject: 'Uncategorized' })
        .eq('user_id', user.id)
        .eq('subject', subjectName);
        
      if (goalsError) {
        console.error('Error updating study goals:', goalsError);
        throw goalsError;
      }
      
      // Update all study sessions that reference this subject
      const { error: sessionsError } = await supabase
        .from('study_sessions')
        .update({ subject: 'Uncategorized' })
        .eq('user_id', user.id)
        .eq('subject', subjectName);
        
      if (sessionsError) {
        console.error('Error updating study sessions:', sessionsError);
        throw sessionsError;
      }
      
      // Now delete the subject from user_subjects
      const { error } = await supabase
        .from("user_subjects")
        .delete()
        .eq("id", subjectId)
        .eq("user_id", user.id);
        
      if (error) {
        console.error('Error deleting subject:', error);
        throw error;
      }
      
      console.log('Subject deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubjects"] });
      toast.success("Subject deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject");
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

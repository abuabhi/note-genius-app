
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
      
      const { error } = await supabase
        .from("user_subjects")
        .delete()
        .eq("id", subjectId)
        .eq("user_id", user.id);
        
      if (error) throw error;
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

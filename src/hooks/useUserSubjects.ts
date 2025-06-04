
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserSubject } from "@/types/subject";

export const useUserSubjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ["userSubjects", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log("useUserSubjects: No user ID available");
        return [];
      }

      console.log("useUserSubjects: Fetching subjects for user:", user.id);
      
      const { data, error } = await supabase
        .from("user_subjects")
        .select("id, user_id, name, created_at, updated_at")
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        console.error("useUserSubjects: Error fetching subjects:", error);
        throw error;
      }

      console.log("useUserSubjects: Successfully fetched", data?.length || 0, "subjects");
      
      return (data || []) as UserSubject[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const addSubjectMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("user_subjects")
        .insert([{ user_id: user.id, name }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["userSubjects", user.id] });
      }
    },
  });

  const removeSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_subjects")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["userSubjects", user.id] });
      }
    },
  });

  const addSubject = async (name: string): Promise<boolean> => {
    try {
      await addSubjectMutation.mutateAsync(name);
      return true;
    } catch (error) {
      console.error("Error adding subject:", error);
      return false;
    }
  };

  const removeSubject = async (id: string): Promise<boolean> => {
    try {
      await removeSubjectMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error("Error removing subject:", error);
      return false;
    }
  };

  return {
    subjects,
    isLoading,
    error,
    addSubject,
    removeSubject
  };
};

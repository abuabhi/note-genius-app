
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { UserSubject } from "@/types/subject";

export const useUserSubjects = () => {
  const { user } = useAuth();

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
        .select(`
          id,
          name,
          color,
          description,
          created_at,
          updated_at,
          subject_categories (
            id,
            name,
            description
          )
        `)
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        console.error("useUserSubjects: Error fetching subjects:", error);
        throw error;
      }

      console.log("useUserSubjects: Successfully fetched", data?.length || 0, "subjects");
      
      return (data || []).map(subject => ({
        id: subject.id,
        name: subject.name,
        color: subject.color,
        description: subject.description,
        created_at: subject.created_at,
        updated_at: subject.updated_at,
        subject_category: subject.subject_categories
      })) as UserSubject[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  return {
    subjects,
    isLoading,
    error
  };
};

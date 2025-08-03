
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/types/admin";

export const useFetchSections = () => {
  // Fetch all sections with subject information
  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("*");

      if (error) throw error;
      
      // Return sections without subject relations since academic_subjects table was removed
      return data.map(section => ({
        ...section,
        subject_id: section.academic_subject_id,
        subject: null, // No longer have subject relations
      })) as Section[];
    },
  });

  return { sections, isLoading };
};

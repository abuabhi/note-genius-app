
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
        .select(`
          *,
          subject:academic_subjects!academic_subject_id(*)
        `);

      if (error) throw error;
      
      // Transform the data to match our Section type
      return data.map(section => ({
        ...section,
        subject_id: section.academic_subject_id,
        subject: section.subject,
      })) as Section[];
    },
  });

  return { sections, isLoading };
};

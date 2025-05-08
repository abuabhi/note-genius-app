
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
        .select("*, subject_categories(*)");

      if (error) throw error;
      return data as Section[];
    },
  });

  return { sections, isLoading };
};


import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/types/admin";
import { toast } from "sonner";

export const useSections = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

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

  // Create section
  const createSection = useMutation({
    mutationFn: async (newSection: Omit<Section, "id" | "created_at" | "updated_at" | "subject">) => {
      const { data, error } = await supabase
        .from("sections")
        .insert(newSection)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Section created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create section");
      console.error("Error creating section:", error);
    }
  });

  // Update section
  const updateSection = useMutation({
    mutationFn: async ({ id, subject, ...updatedSection }: Section) => {
      const { data, error } = await supabase
        .from("sections")
        .update(updatedSection)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Section updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update section");
      console.error("Error updating section:", error);
    }
  });

  // Delete section
  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      toast.success("Section deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete section");
      console.error("Error deleting section:", error);
    }
  });

  return {
    sections,
    isLoading,
    loading,
    createSection,
    updateSection,
    deleteSection
  };
};

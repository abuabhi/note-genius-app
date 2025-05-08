
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Grade, CSVGradeRow } from "@/types/admin";
import { toast } from "sonner";

export const useGrades = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch all grades
  const { data: grades = [], isLoading } = useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .order("level");

      if (error) throw error;
      return data as Grade[];
    },
  });

  // Create grade
  const createGrade = useMutation({
    mutationFn: async (newGrade: Omit<Grade, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("grades")
        .insert(newGrade)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("Grade created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create grade");
      console.error("Error creating grade:", error);
    }
  });

  // Update grade
  const updateGrade = useMutation({
    mutationFn: async ({ id, ...updatedGrade }: Grade) => {
      const { data, error } = await supabase
        .from("grades")
        .update(updatedGrade)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("Grade updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update grade");
      console.error("Error updating grade:", error);
    }
  });

  // Delete grade
  const deleteGrade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("grades")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      toast.success("Grade deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete grade");
      console.error("Error deleting grade:", error);
    }
  });

  // Bulk import grades from CSV
  const importGradesFromCSV = async (rows: CSVGradeRow[]): Promise<{
    success: boolean;
    result?: any;
    error?: any;
  }> => {
    try {
      setLoading(true);
      
      // Process each row and insert into database
      const { data, error } = await supabase
        .from("grades")
        .insert(rows)
        .select();
      
      if (error) throw error;
      
      // Refresh grades data
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      
      return { 
        success: true, 
        result: {
          totalRows: rows.length,
          successCount: data?.length || 0,
          errorCount: 0,
          errors: []
        }
      };
    } catch (error) {
      console.error("Error importing grades:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    grades,
    isLoading,
    loading,
    createGrade,
    updateGrade,
    deleteGrade,
    importGradesFromCSV
  };
};


import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CSVSubjectRow } from "@/types/admin";
import { SubjectCategory } from "@/types/flashcard";
import { toast } from "sonner";

export const useSubjects = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch all subjects with grade information
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subject_categories")
        .select("*, grades(*)");

      if (error) throw error;
      return data as (SubjectCategory & { grades: any })[];
    },
  });

  // Create subject
  const createSubject = useMutation({
    mutationFn: async (newSubject: Omit<SubjectCategory, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("subject_categories")
        .insert(newSubject)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create subject");
      console.error("Error creating subject:", error);
    }
  });

  // Update subject
  const updateSubject = useMutation({
    mutationFn: async ({ id, ...updatedSubject }: SubjectCategory) => {
      const { data, error } = await supabase
        .from("subject_categories")
        .update(updatedSubject)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update subject");
      console.error("Error updating subject:", error);
    }
  });

  // Delete subject
  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subject_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete subject");
      console.error("Error deleting subject:", error);
    }
  });

  // Bulk import subjects from CSV
  const importSubjectsFromCSV = async (rows: CSVSubjectRow[]): Promise<{
    success: boolean;
    result?: any;
    error?: any;
  }> => {
    try {
      setLoading(true);
      
      // Get current grades for reference
      const { data: grades, error: gradesError } = await supabase
        .from("grades")
        .select("id, name");
        
      if (gradesError) throw gradesError;
      
      const gradeMap = new Map(grades?.map(g => [g.name.toLowerCase(), g.id]) || []);
      
      // Process each row and prepare for insertion
      const validRows: any[] = [];
      const errors: { row: number; message: string }[] = [];
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Validate required fields
        if (!row.name) {
          errors.push({ row: i + 1, message: "Name is required" });
          continue;
        }
        
        if (!row.grade_name) {
          errors.push({ row: i + 1, message: "Grade name is required" });
          continue;
        }
        
        // Find grade id
        const gradeName = row.grade_name.trim().toLowerCase();
        const gradeId = gradeMap.get(gradeName);
        
        if (!gradeId) {
          errors.push({ row: i + 1, message: `Grade "${row.grade_name}" not found` });
          continue;
        }
        
        // Add to valid rows
        validRows.push({
          name: row.name.trim(),
          grade_id: gradeId,
          description: row.description || null
        });
      }
      
      // If there are no valid rows, return result with errors
      if (validRows.length === 0) {
        const result = {
          totalRows: rows.length,
          successCount: 0,
          errorCount: errors.length,
          errors
        };
        return { success: true, result };
      }
      
      // Insert valid rows
      const { data, error } = await supabase
        .from("subject_categories")
        .insert(validRows)
        .select();
        
      if (error) throw error;
      
      // Refresh subjects data
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      
      return { 
        success: true, 
        result: {
          totalRows: rows.length,
          successCount: data?.length || 0,
          errorCount: errors.length,
          errors
        }
      };
    } catch (error) {
      console.error("Error importing subjects:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    subjects,
    isLoading,
    loading,
    createSubject,
    updateSubject,
    deleteSubject,
    importSubjectsFromCSV
  };
};

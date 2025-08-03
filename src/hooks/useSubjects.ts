
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CSVSubjectRow } from "@/types/admin";
import { UserSubject } from "@/types/flashcard";
import { toast } from "sonner";

/**
 * @deprecated This hook is deprecated. Use useUserSubjects from '@/hooks/useUserSubjects' instead.
 * This hook remains for backward compatibility but will be removed in a future version.
 */
export const useSubjects = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch all user subjects
  const { data: userSubjects = [], isLoading } = useQuery({
    queryKey: ["userSubjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subjects")
        .select("*");

      if (error) throw error;
      return data as UserSubject[];
    },
  });

  // Create user subject
  const createUserSubject = useMutation({
    mutationFn: async (newSubject: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("user_subjects")
        .insert({ ...newSubject, user_id: (await supabase.auth.getUser()).data.user?.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubjects"] });
      toast.success("Subject created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create subject");
      console.error("Error creating subject:", error);
    }
  });

  // Update user subject
  const updateUserSubject = useMutation({
    mutationFn: async ({ id, ...updatedSubject }: UserSubject) => {
      const { data, error } = await supabase
        .from("user_subjects")
        .update(updatedSubject)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubjects"] });
      toast.success("Subject updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update subject");
      console.error("Error updating subject:", error);
    }
  });

  // Delete user subject
  const deleteUserSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_subjects")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubjects"] });
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
      const user = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("user_subjects")
        .insert(validRows.map(row => ({ ...row, user_id: user.data.user?.id })))
        .select();
        
      if (error) throw error;
      
      // Refresh subjects data
      queryClient.invalidateQueries({ queryKey: ["userSubjects"] });
      
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
    userSubjects,
    isLoading,
    loading,
    createUserSubject,
    updateUserSubject,
    deleteUserSubject,
    importSubjectsFromCSV
  };
};

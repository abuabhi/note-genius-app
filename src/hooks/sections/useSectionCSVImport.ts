
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CSVSectionRow } from "@/types/admin";

export const useSectionCSVImport = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Bulk import sections from CSV
  const importSectionsFromCSV = async (rows: CSVSectionRow[]) => {
    try {
      setLoading(true);
      
      // Since academic_subjects table was removed, we'll skip subject validation
      // Users can create sections without subject references
      
      // Get grades for reference
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
        
        // Add to valid rows (simplified without subject/grade validation)
        validRows.push({
          name: row.name.trim(),
          academic_subject_id: null, // No longer linking to academic subjects
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
        .from("sections")
        .insert(validRows)
        .select();
        
      if (error) throw error;
      
      // Refresh sections data
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      
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
      console.error("Error importing sections:", error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    importSectionsFromCSV
  };
};

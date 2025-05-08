
import { useState } from "react";
import { CSVSubjectRow, CSVUploadResult } from "@/types/admin";
import { useSubjects } from "@/hooks/useSubjects";
import { parseCSV } from "@/utils/csvUtils";
import { toast } from "sonner";

export const useSubjectsImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { importSubjectsFromCSV } = useSubjects();

  const importSubjects = async (file: File): Promise<CSVUploadResult> => {
    try {
      setIsImporting(true);
      
      // Parse CSV file
      const rows = await parseCSV(file);
      
      // Validate and format data
      const validRows: CSVSubjectRow[] = [];
      const errors: { row: number; message: string }[] = [];
      
      rows.forEach((row: any, index) => {
        // Validate required fields
        if (!row.name) {
          errors.push({ row: index + 1, message: "Name is required" });
          return;
        }
        
        if (!row.grade_name) {
          errors.push({ row: index + 1, message: "Grade name is required" });
          return;
        }
        
        // Format and add to valid rows
        validRows.push({
          name: row.name.trim(),
          grade_name: row.grade_name.trim(),
          description: row.description || undefined
        });
      });
      
      // If there are no valid rows, return result with errors
      if (validRows.length === 0) {
        const result = {
          totalRows: rows.length,
          successCount: 0,
          errorCount: errors.length,
          errors
        };
        return result;
      }
      
      // Import valid rows
      const { success, result, error } = await importSubjectsFromCSV(validRows);
      
      if (!success || error) {
        throw error || new Error("Failed to import subjects");
      }
      
      // Merge any parse errors with import errors
      const finalResult = {
        ...result,
        errors: [...(result?.errors || []), ...errors],
        errorCount: (result?.errorCount || 0) + errors.length
      };
      
      toast.success(`Imported ${finalResult.successCount} subjects successfully`);
      return finalResult;
    } catch (error) {
      console.error("Error importing subjects:", error);
      const errorResult = {
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, message: `Import failed: ${error}` }]
      };
      toast.error("Failed to import subjects");
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importSubjects,
    isImporting
  };
};

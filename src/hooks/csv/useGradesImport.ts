
import { useState } from "react";
import { CSVGradeRow, CSVUploadResult } from "@/types/admin";
import { useGrades } from "@/hooks/useGrades";
import { parseCSV } from "@/utils/csvUtils";
import { toast } from "sonner";

export const useGradesImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { importGradesFromCSV } = useGrades();

  const importGrades = async (file: File): Promise<CSVUploadResult> => {
    try {
      setIsImporting(true);
      
      // Parse CSV file
      const rows = await parseCSV(file);
      
      // Validate and format data
      const validRows: CSVGradeRow[] = [];
      const errors: { row: number; message: string }[] = [];
      
      rows.forEach((row: any, index) => {
        // Validate required fields
        if (!row.name) {
          errors.push({ row: index + 1, message: "Name is required" });
          return;
        }
        
        if (!row.level || isNaN(parseInt(row.level))) {
          errors.push({ row: index + 1, message: "Level must be a valid number" });
          return;
        }
        
        // Format and add to valid rows
        validRows.push({
          name: row.name.trim(),
          level: parseInt(row.level),
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
      const { success, result, error } = await importGradesFromCSV(validRows);
      
      if (!success || error) {
        throw error || new Error("Failed to import grades");
      }
      
      // Merge any parse errors with import errors
      const finalResult = {
        ...result,
        errors: [...(result?.errors || []), ...errors],
        errorCount: (result?.errorCount || 0) + errors.length
      };
      
      toast.success(`Imported ${finalResult.successCount} grades successfully`);
      return finalResult;
    } catch (error) {
      console.error("Error importing grades:", error);
      const errorResult = {
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, message: `Import failed: ${error}` }]
      };
      toast.error("Failed to import grades");
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importGrades,
    isImporting
  };
};

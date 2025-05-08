
import { useState } from "react";
import { CSVSectionRow, CSVUploadResult } from "@/types/admin";
import { useSectionCSVImport } from "@/hooks/sections/useSectionCSVImport";
import { parseCSV } from "@/utils/csvUtils";
import { toast } from "sonner";

export const useSectionsImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { importSectionsFromCSV } = useSectionCSVImport();

  const importSections = async (file: File): Promise<CSVUploadResult> => {
    try {
      setIsImporting(true);
      
      // Parse CSV file
      const rows = await parseCSV(file);
      
      // Validate and format data
      const validRows: CSVSectionRow[] = [];
      const errors: { row: number; message: string }[] = [];
      
      rows.forEach((row: any, index) => {
        // Validate required fields
        if (!row.name) {
          errors.push({ row: index + 1, message: "Name is required" });
          return;
        }
        
        if (!row.subject_name) {
          errors.push({ row: index + 1, message: "Subject name is required" });
          return;
        }
        
        if (!row.grade_name) {
          errors.push({ row: index + 1, message: "Grade name is required" });
          return;
        }
        
        // Format and add to valid rows
        validRows.push({
          name: row.name.trim(),
          subject_name: row.subject_name.trim(),
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
      const { success, result, error } = await importSectionsFromCSV(validRows);
      
      if (!success || error) {
        throw error || new Error("Failed to import sections");
      }
      
      // Merge any parse errors with import errors
      const finalResult = {
        ...result,
        errors: [...(result?.errors || []), ...errors],
        errorCount: (result?.errorCount || 0) + errors.length
      };
      
      toast.success(`Imported ${finalResult.successCount} sections successfully`);
      return finalResult;
    } catch (error) {
      console.error("Error importing sections:", error);
      const errorResult = {
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, message: `Import failed: ${error}` }]
      };
      toast.error("Failed to import sections");
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importSections,
    isImporting
  };
};

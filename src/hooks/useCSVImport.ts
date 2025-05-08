
import { useState } from "react";
import Papa from "papaparse";
import { CSVGradeRow, CSVSubjectRow, CSVSectionRow, CSVFlashcardRow, CSVUploadResult } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useGrades } from "./useGrades";
import { useSubjects } from "./useSubjects";
import { useSections } from "./useSections";

export const useCSVImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<CSVUploadResult | null>(null);
  const { fetchCategories } = useFlashcards();
  const { importGradesFromCSV } = useGrades();
  const { importSubjectsFromCSV } = useSubjects();
  const { importSectionsFromCSV } = useSections();

  // Parse CSV file
  const parseCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  // Import grades from CSV
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
        setResults(result);
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
      
      setResults(finalResult);
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
      setResults(errorResult);
      toast.error("Failed to import grades");
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  // Import subjects from CSV
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
        setResults(result);
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
      
      setResults(finalResult);
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
      setResults(errorResult);
      toast.error("Failed to import subjects");
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  // Import sections from CSV
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
        setResults(result);
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
      
      setResults(finalResult);
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
      setResults(errorResult);
      toast.error("Failed to import sections");
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  // Import flashcards from CSV
  const importFlashcards = async (file: File): Promise<CSVUploadResult> => {
    try {
      setIsImporting(true);
      
      // Parse CSV file
      const rows = await parseCSV(file);
      
      // Get current grades, subjects, and sections for reference
      const { data: currentGrades } = await supabase.from("grades").select("id, name");
      const gradeMap = new Map(currentGrades?.map(g => [g.name.toLowerCase(), g.id]) || []);
      
      const { data: currentSubjects } = await supabase.from("subject_categories").select("id, name, grade_id");
      const subjectMap = new Map();
      
      currentSubjects?.forEach(subject => {
        subjectMap.set(`${subject.name.toLowerCase()}_${subject.grade_id}`, subject.id);
      });
      
      const { data: currentSections } = await supabase.from("sections").select("id, name, subject_id");
      const sectionMap = new Map();
      
      currentSections?.forEach(section => {
        sectionMap.set(`${section.name.toLowerCase()}_${section.subject_id}`, section.id);
      });
      
      // Group rows by set_name
      const flashcardsBySet = new Map<string, CSVFlashcardRow[]>();
      
      rows.forEach((row: CSVFlashcardRow) => {
        if (!row.set_name) return;
        
        const setName = row.set_name.trim();
        if (!flashcardsBySet.has(setName)) {
          flashcardsBySet.set(setName, []);
        }
        
        flashcardsBySet.get(setName)?.push(row);
      });
      
      const errors: { row: number; message: string }[] = [];
      let successCount = 0;
      
      // Process each set
      for (const [setName, flashcards] of flashcardsBySet.entries()) {
        try {
          // Validate the first card to get set metadata
          const firstCard = flashcards[0];
          
          if (!firstCard.subject_name || !firstCard.grade_name) {
            errors.push({ 
              row: rows.findIndex(r => (r as CSVFlashcardRow).set_name === setName) + 1, 
              message: `Set "${setName}" is missing subject or grade` 
            });
            continue;
          }
          
          // Get the grade ID
          const gradeName = firstCard.grade_name.trim().toLowerCase();
          const gradeId = gradeMap.get(gradeName);
          
          if (!gradeId) {
            errors.push({ 
              row: rows.findIndex(r => (r as CSVFlashcardRow).set_name === setName) + 1, 
              message: `Grade "${firstCard.grade_name}" not found for set "${setName}"` 
            });
            continue;
          }
          
          // Get the subject ID
          const subjectName = firstCard.subject_name.trim().toLowerCase();
          const subjectKey = `${subjectName}_${gradeId}`;
          const subjectId = subjectMap.get(subjectKey);
          
          if (!subjectId) {
            errors.push({ 
              row: rows.findIndex(r => (r as CSVFlashcardRow).set_name === setName) + 1, 
              message: `Subject "${firstCard.subject_name}" not found for grade "${firstCard.grade_name}"` 
            });
            continue;
          }
          
          // Get the section ID if specified
          let sectionId = null;
          if (firstCard.section_name) {
            const sectionName = firstCard.section_name.trim().toLowerCase();
            const sectionKey = `${sectionName}_${subjectId}`;
            sectionId = sectionMap.get(sectionKey);
            
            if (!sectionId) {
              errors.push({ 
                row: rows.findIndex(r => (r as CSVFlashcardRow).set_name === setName) + 1, 
                message: `Section "${firstCard.section_name}" not found for subject "${firstCard.subject_name}"` 
              });
              continue;
            }
          }
          
          // Create the flashcard set
          const { data: setData, error: setError } = await supabase
            .from("flashcard_sets")
            .insert({
              name: setName,
              subject: firstCard.subject_name,
              category_id: subjectId,
              section_id: sectionId,
              is_built_in: true
            })
            .select()
            .single();
          
          if (setError) throw setError;
          
          // Create all flashcards
          const flashcardRows = flashcards.map(card => ({
            front_content: card.front_content,
            back_content: card.back_content,
            difficulty: card.difficulty || 1,
            is_built_in: true
          }));
          
          const { data: cardData, error: cardError } = await supabase
            .from("flashcards")
            .insert(flashcardRows)
            .select();
          
          if (cardError) throw cardError;
          
          // Link flashcards to the set
          if (cardData && cardData.length > 0) {
            const setCardRows = cardData.map((card, index) => ({
              flashcard_id: card.id,
              set_id: setData.id,
              position: index + 1
            }));
            
            const { error: linkError } = await supabase
              .from("flashcard_set_cards")
              .insert(setCardRows);
            
            if (linkError) throw linkError;
            
            successCount += cardData.length;
          }
        } catch (error) {
          console.error(`Error importing set "${setName}":`, error);
          errors.push({ 
            row: 0, 
            message: `Error importing set "${setName}": ${error}` 
          });
        }
      }
      
      const result = {
        totalRows: rows.length,
        successCount,
        errorCount: errors.length,
        errors
      };
      
      setResults(result);
      
      // Refresh flashcard data
      fetchCategories();
      
      toast.success(`Imported ${successCount} flashcards in ${flashcardsBySet.size} sets successfully`);
      return result;
    } catch (error) {
      console.error("Error importing flashcards:", error);
      const errorResult = {
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, message: `Import failed: ${error}` }]
      };
      setResults(errorResult);
      toast.error("Failed to import flashcards");
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  // Get template for CSV import
  const getTemplateCSV = (type: 'grades' | 'subjects' | 'sections' | 'flashcards'): string => {
    switch (type) {
      case 'grades':
        return 'name,level,description\nGrade 1,1,"First grade"\nGrade 2,2,"Second grade"';
      case 'subjects':
        return 'name,grade_name,description\nMath,Grade 1,"Mathematics"\nScience,Grade 1,"Science"';
      case 'sections':
        return 'name,subject_name,grade_name,description\nAlgebra,Math,Grade 1,"Algebra section"\nGeometry,Math,Grade 1,"Geometry section"';
      case 'flashcards':
        return 'set_name,front_content,back_content,subject_name,grade_name,section_name,difficulty\n"Basic Math","What is 2+2?","4","Math","Grade 1","Arithmetic",1\n"Basic Math","What is 5x5?","25","Math","Grade 1","Arithmetic",2';
      default:
        return '';
    }
  };

  return {
    isImporting,
    results,
    importGrades,
    importSubjects,
    importSections,
    importFlashcards,
    getTemplateCSV,
    resetResults: () => setResults(null)
  };
};

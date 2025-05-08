
import { useState } from "react";
import { CSVFlashcardRow, CSVUploadResult } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";
import { parseCSV } from "@/utils/csvUtils";
import { toast } from "sonner";
import { useFlashcards } from "@/contexts/FlashcardContext";

export const useFlashcardsImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { fetchCategories } = useFlashcards();

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
      toast.error("Failed to import flashcards");
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importFlashcards,
    isImporting
  };
};

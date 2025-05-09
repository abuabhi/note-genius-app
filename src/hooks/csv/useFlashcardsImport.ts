
import { useState } from "react";
import { CSVFlashcardRow, CSVUploadResult } from "@/types/admin";
import { parseCSV } from "@/utils/csvUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useFlashcards } from "@/contexts/FlashcardContext";

export const useFlashcardsImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<CSVUploadResult | null>(null);
  
  // Get fetchCategories from context or provide a fallback
  const flashcardContext = useFlashcards();
  const fetchCategories = flashcardContext?.fetchCategories || (() => Promise.resolve([]));

  const importFlashcards = async (file: File): Promise<CSVUploadResult> => {
    try {
      setIsImporting(true);
      
      // Parse CSV file
      const rows = await parseCSV(file);
      
      // Get current countries for reference
      const { data: currentCountries } = await supabase.from("countries").select("id, code, name");
      const countryMap = new Map();
      
      currentCountries?.forEach(country => {
        countryMap.set(country.code.toLowerCase(), country.id);
        countryMap.set(country.name.toLowerCase(), country.id);
      });
      
      // Get current grades, subjects, and sections for reference
      const { data: currentGrades } = await supabase.from("grades").select("id, name");
      const gradeMap = new Map(currentGrades?.map(g => [g.name.toLowerCase(), g.id]) || []);
      
      const { data: currentSubjects } = await supabase.from("subject_categories").select("id, name, grade_id, country_id");
      const subjectMap = new Map();
      
      currentSubjects?.forEach(subject => {
        // Include country_id in the key to handle subjects with same name in different countries
        const key = `${subject.name.toLowerCase()}_${subject.grade_id}_${subject.country_id || 'global'}`;
        subjectMap.set(key, subject.id);
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
          
          // Get the country ID if specified
          let countryId = null;
          if (firstCard.country_code || firstCard.country_name) {
            const countryKey = (firstCard.country_code || firstCard.country_name || '').toLowerCase();
            countryId = countryMap.get(countryKey);
            
            if (!countryId) {
              errors.push({ 
                row: rows.findIndex(r => (r as CSVFlashcardRow).set_name === setName) + 1, 
                message: `Country "${firstCard.country_code || firstCard.country_name}" not found for set "${setName}"` 
              });
              continue;
            }
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
          // Include country in the key to handle subjects with same name in different countries
          const subjectKey = `${subjectName}_${gradeId}_${countryId || 'global'}`;
          const subjectId = subjectMap.get(subjectKey);
          
          if (!subjectId) {
            errors.push({ 
              row: rows.findIndex(r => (r as CSVFlashcardRow).set_name === setName) + 1, 
              message: `Subject "${firstCard.subject_name}" not found for grade "${firstCard.grade_name}"${countryId ? ` and country ${firstCard.country_code || firstCard.country_name}` : ''}` 
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
              country_id: countryId,
              education_system: firstCard.education_system || null,
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
      
      // Store the results for display
      setImportResults(result);
      
      // Refresh flashcard data
      try {
        await fetchCategories();
      } catch (error) {
        console.error("Error refreshing categories after import:", error);
      }
      
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
      setImportResults(errorResult);
      toast.error("Failed to import flashcards");
      return errorResult;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importFlashcards,
    isImporting,
    importResults
  };
};

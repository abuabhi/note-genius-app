
import { useState } from 'react';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { parseCSV } from '@/utils/csvUtils';

interface CSVFlashcardRow {
  front: string;
  back: string;
  difficulty?: number;
  set_name?: string;
  subject?: string;
  topic?: string;
}

export const useFlashcardsImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: { row: number; message: string }[];
  } | null>(null);
  const { fetchAcademicSubjects, createFlashcardSet, addFlashcard } = useFlashcards();

  const importFlashcards = async (file: File) => {
    setIsImporting(true);
    setImportResults(null);
    
    try {
      const rows = await parseCSV(file) as CSVFlashcardRow[];
      const validRows = validateCSVData(rows);
      await processCSVData(validRows);
    } catch (error) {
      console.error('Error importing flashcards:', error);
      toast.error('Failed to import flashcards');
      setImportResults({
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [{ row: 0, message: 'Failed to parse CSV file' }]
      });
    } finally {
      setIsImporting(false);
    }
  };

  const processCSVData = async (csvData: CSVFlashcardRow[]) => {
    try {
      console.log('Processing CSV data with', csvData.length, 'rows');
      
      // Fetch academic subjects for mapping
      await fetchAcademicSubjects();
      
      // Group flashcards by set
      const flashcardsBySet = new Map<string, CSVFlashcardRow[]>();
      
      csvData.forEach(row => {
        const setName = row.set_name || 'Imported Flashcards';
        if (!flashcardsBySet.has(setName)) {
          flashcardsBySet.set(setName, []);
        }
        flashcardsBySet.get(setName)!.push(row);
      });
      
      console.log('Grouped flashcards into', flashcardsBySet.size, 'sets');
      
      let totalSuccess = 0;
      let totalErrors = 0;
      const errors: { row: number; message: string }[] = [];
      
      // Process each set
      for (const [setName, cards] of flashcardsBySet) {
        console.log(`Processing set: ${setName} with ${cards.length} cards`);
        
        // Find or create academic subject
        let subjectId = null;
        const firstCard = cards[0];
        
        if (firstCard.subject) {
          const { data: subjects, error } = await supabase
            .from('academic_subjects')
            .select('id, name, grade_id, country_id')
            .ilike('name', `%${firstCard.subject}%`);
            
          if (error) {
            console.error('Error fetching subjects:', error);
          } else if (subjects && subjects.length > 0) {
            subjectId = subjects[0].id;
            console.log(`Found subject: ${subjects[0].name} with ID: ${subjectId}`);
          }
        }
        
        // Create flashcard set
        const setData = {
          name: setName,
          description: `Imported from CSV - ${cards.length} cards`,
          subject: firstCard.subject || 'General',
          topic: firstCard.topic || '',
          subject_id: subjectId
        };
        
        console.log('Creating set with data:', setData);
        const newSet = await createFlashcardSet(setData);
        
        if (!newSet) {
          console.error('Failed to create set:', setName);
          totalErrors += cards.length;
          errors.push({ row: 1, message: `Failed to create set: ${setName}` });
          continue;
        }
        
        console.log('Created set:', newSet.id);
        
        // Add flashcards to set
        let successCount = 0;
        let errorCount = 0;
        
        for (const card of cards) {
          try {
            await addFlashcard({
              front_content: card.front.trim(),
              back_content: card.back.trim(),
              set_id: newSet.id,
              difficulty: card.difficulty || 1
            });
            successCount++;
          } catch (error) {
            console.error('Error adding flashcard:', error);
            errorCount++;
          }
        }
        
        totalSuccess += successCount;
        totalErrors += errorCount;
        
        console.log(`Set ${setName}: ${successCount} cards added, ${errorCount} errors`);
      }
      
      setImportResults({
        totalRows: csvData.length,
        successCount: totalSuccess,
        errorCount: totalErrors,
        errors
      });
      
      toast.success(`Successfully imported ${totalSuccess} flashcards into ${flashcardsBySet.size} sets`);
      
    } catch (error) {
      console.error('Error processing CSV import:', error);
      toast.error('Failed to import flashcards');
      setImportResults({
        totalRows: csvData.length,
        successCount: 0,
        errorCount: csvData.length,
        errors: [{ row: 0, message: 'Processing failed' }]
      });
    }
  };

  const validateCSVData = (data: any[]): CSVFlashcardRow[] => {
    const validRows: CSVFlashcardRow[] = [];
    const errors: string[] = [];
    
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      
      if (!row.front || !row.back) {
        errors.push(`Row ${rowNumber}: Missing front or back content`);
        return;
      }
      
      if (row.front.trim() === '' || row.back.trim() === '') {
        errors.push(`Row ${rowNumber}: Empty front or back content`);
        return;
      }
      
      validRows.push({
        front: row.front,
        back: row.back,
        difficulty: parseInt(row.difficulty) || 1,
        set_name: row.set_name || row.setName || 'Imported Flashcards',
        subject: row.subject,
        topic: row.topic
      });
    });
    
    if (errors.length > 0) {
      console.warn('CSV validation errors:', errors);
      toast.error(`Found ${errors.length} validation errors. Check console for details.`);
    }
    
    return validRows;
  };

  return {
    importFlashcards,
    isImporting,
    importResults,
    processCSVData,
    validateCSVData
  };
};

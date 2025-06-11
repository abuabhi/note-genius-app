
import { useState } from 'react';
import { useFlashcards } from '@/contexts/FlashcardContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const { fetchAcademicSubjects, createFlashcardSet, addFlashcard } = useFlashcards();

  const processCSVData = async (csvData: CSVFlashcardRow[]) => {
    setIsImporting(true);
    
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
        
        console.log(`Set ${setName}: ${successCount} cards added, ${errorCount} errors`);
      }
      
      toast.success(`Successfully imported ${csvData.length} flashcards into ${flashcardsBySet.size} sets`);
      
    } catch (error) {
      console.error('Error processing CSV import:', error);
      toast.error('Failed to import flashcards');
    } finally {
      setIsImporting(false);
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
    isImporting,
    processCSVData,
    validateCSVData
  };
};

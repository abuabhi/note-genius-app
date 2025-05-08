import { useState } from 'react';
import { parseCSV } from '@/utils/csvUtils';
import { supabase } from '@/integrations/supabase/client';
import { CSVQuizRow } from '@/types/quiz';
import { toast } from '@/hooks/use-toast';

export const useQuizImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  const importQuizzes = async (file: File) => {
    setIsImporting(true);
    setImportResults(null);
    
    try {
      const rows = await parseCSV(file) as CSVQuizRow[];
      
      if (!rows.length) {
        throw new Error('CSV file is empty or improperly formatted');
      }

      const totalRows = rows.length;
      let successCount = 0;
      let errorCount = 0;
      const errors: { row: number; message: string }[] = [];
      
      // Group questions by quiz title
      const quizGroups: Record<string, CSVQuizRow[]> = {};
      
      rows.forEach(row => {
        if (!quizGroups[row.quiz_title]) {
          quizGroups[row.quiz_title] = [];
        }
        quizGroups[row.quiz_title].push(row);
      });
      
      // Process each quiz
      for (const [quizTitle, quizRows] of Object.entries(quizGroups)) {
        try {
          // Get the first row for quiz metadata
          const firstRow = quizRows[0];
          
          // Find subject category
          const { data: subjects } = await supabase
            .from('subject_categories')
            .select('id')
            .eq('name', firstRow.subject_name)
            .limit(1);
          
          if (!subjects || !subjects.length) {
            throw new Error(`Subject "${firstRow.subject_name}" not found`);
          }
          
          // Find grade if provided
          let gradeId = null;
          if (firstRow.grade_name) {
            const { data: grades } = await supabase
              .from('grades')
              .select('id')
              .eq('name', firstRow.grade_name)
              .limit(1);
            
            if (grades && grades.length) {
              gradeId = grades[0].id;
            }
          }
          
          // Find section if provided
          let sectionId = null;
          if (firstRow.section_name) {
            const { data: sections } = await supabase
              .from('sections')
              .select('id')
              .eq('name', firstRow.section_name)
              .limit(1);
            
            if (sections && sections.length) {
              sectionId = sections[0].id;
            }
          }
          
          // Create the quiz
          const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .insert({
              title: quizTitle,
              description: firstRow.quiz_description || null,
              category_id: subjects[0].id,
              grade_id: gradeId,
              section_id: sectionId,
              source_type: 'prebuilt',
              is_public: true,
              user_id: (await supabase.auth.getUser()).data.user?.id
            })
            .select()
            .single();
          
          if (quizError) {
            throw quizError;
          }
          
          // Add each question
          for (const [index, row] of quizRows.entries()) {
            // Create question
            const { data: question, error: questionError } = await supabase
              .from('quiz_questions')
              .insert({
                quiz_id: quiz.id,
                question: row.question,
                explanation: row.explanation || null,
                difficulty: row.difficulty ? parseInt(row.difficulty, 10) : 1,
                position: index
              })
              .select()
              .single();
            
            if (questionError) {
              throw questionError;
            }
            
            // Create options
            const options = [
              { content: row.correct_option, is_correct: true, position: 0 },
              { content: row.option2, is_correct: false, position: 1 },
            ];
            
            if (row.option3) {
              options.push({ content: row.option3, is_correct: false, position: 2 });
            }
            
            if (row.option4) {
              options.push({ content: row.option4, is_correct: false, position: 3 });
            }
            
            const { error: optionsError } = await supabase
              .from('quiz_options')
              .insert(options.map(opt => ({
                question_id: question.id,
                content: opt.content,
                is_correct: opt.is_correct,
                position: opt.position
              })));
            
            if (optionsError) {
              throw optionsError;
            }
          }
          
          successCount += quizRows.length;
        } catch (error) {
          console.error(`Error importing quiz "${quizTitle}":`, error);
          errorCount += quizRows.length;
          errors.push({
            row: rows.findIndex(r => r.quiz_title === quizTitle) + 1, // +1 for heading row
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      setImportResults({
        totalRows,
        successCount,
        errorCount,
        errors
      });
      
      if (successCount === totalRows) {
        toast({
          title: "Import complete",
          description: `Successfully imported ${successCount} quiz questions.`
        });
      } else if (successCount > 0) {
        toast({
          title: "Import partially complete",
          description: `Imported ${successCount} out of ${totalRows} quiz questions. Check errors for details.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Import failed",
          description: "Failed to import any quiz questions. Check errors for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setImportResults({
        totalRows: 0,
        successCount: 0,
        errorCount: 0,
        errors: [{
          row: 0,
          message: error instanceof Error ? error.message : 'Unknown error during CSV parsing'
        }]
      });
      
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : 'Failed to parse CSV file',
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Generate template CSV content for quizzes
  const getQuizTemplate = (): string => {
    return 'quiz_title,quiz_description,subject_name,grade_name,section_name,question,correct_option,option2,option3,option4,explanation,difficulty\n' +
      '"Basic Math","Elementary math questions","Mathematics","Grade 1","Arithmetic","What is 2+2?","4","3","5","6","Basic addition",1\n' +
      '"Basic Math","Elementary math questions","Mathematics","Grade 1","Arithmetic","What is 5-3?","2","1","3","5","Basic subtraction",1\n' +
      '"Science Quiz","Introduction to science","Sciences","Grade 2","General Science","What is water made of?","H2O","CO2","O2","N2","Water is made of hydrogen and oxygen",2';
  };

  return {
    importQuizzes,
    getQuizTemplate,
    isImporting,
    importResults
  };
};

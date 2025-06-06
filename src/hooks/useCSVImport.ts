
import { useState } from "react";
import { CSVUploadResult } from "@/types/admin";
import { useGradesImport } from "@/hooks/csv/useGradesImport";
import { useSubjectsImport } from "@/hooks/csv/useSubjectsImport";
import { useSectionsImport } from "@/hooks/csv/useSectionsImport";
import { useFlashcardsImport } from "@/hooks/csv/useFlashcardsImport";
import { useNotesImport } from "@/hooks/csv/useNotesImport";
import { getTemplateCSV } from "@/utils/csvUtils";

export const useCSVImport = () => {
  const [results, setResults] = useState<CSVUploadResult | null>(null);
  
  const gradesImport = useGradesImport();
  const subjectsImport = useSubjectsImport();
  const sectionsImport = useSectionsImport();
  const flashcardsImport = useFlashcardsImport();
  const notesImport = useNotesImport();

  // Determine if any import is in progress
  const isImporting = 
    gradesImport.isImporting || 
    subjectsImport.isImporting || 
    sectionsImport.isImporting || 
    flashcardsImport.isImporting ||
    notesImport.isImporting;

  // Import grades wrapper with result tracking
  const importGrades = async (file: File): Promise<CSVUploadResult> => {
    const result = await gradesImport.importGrades(file);
    setResults(result);
    return result;
  };

  // Import subjects wrapper with result tracking
  const importSubjects = async (file: File): Promise<CSVUploadResult> => {
    const result = await subjectsImport.importSubjects(file);
    setResults(result);
    return result;
  };

  // Import sections wrapper with result tracking
  const importSections = async (file: File): Promise<CSVUploadResult> => {
    const result = await sectionsImport.importSections(file);
    setResults(result);
    return result;
  };

  // Import flashcards wrapper with result tracking
  const importFlashcards = async (file: File): Promise<CSVUploadResult> => {
    const result = await flashcardsImport.importFlashcards(file);
    setResults(result);
    return result;
  };

  // Import notes wrapper with result tracking
  const importNotes = async (file: File): Promise<CSVUploadResult> => {
    const result = await notesImport.importNotes(file);
    setResults(result);
    return result;
  };

  return {
    isImporting,
    results,
    importGrades,
    importSubjects,
    importSections,
    importFlashcards,
    importNotes,
    getTemplateCSV,
    resetResults: () => setResults(null)
  };
};


import { useState, useEffect } from 'react';
import { Note } from "@/types/note";
import { extractSubjects } from './filterUtils';

/**
 * Hook to manage subjects state
 */
export function useSubjectsState(notes: Note[]) {
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  
  // Extract subjects from notes
  useEffect(() => {
    const subjects = extractSubjects(notes);
    
    setAvailableSubjects(prevSubjects => {
      const allSubjects = [...new Set([...prevSubjects, ...subjects])];
      return allSubjects.filter(subj => subj && subj.trim() !== '');
    });
  }, [notes]);
  
  // Add a subject to availableSubjects
  const addSubject = (subject: string) => {
    if (!subject || subject.trim() === '') return;
    
    // Check if subject already exists
    if (availableSubjects.includes(subject.trim())) return;
    
    // Add the new subject
    setAvailableSubjects(prev => [...prev, subject.trim()]);
  };
  
  return {
    availableSubjects,
    addSubject
  };
}


import { useState, useEffect } from 'react';
import { Note } from "@/types/note";
import { extractCategories } from './filterUtils';

/**
 * Hook to manage categories state
 */
export function useCategoriesState(notes: Note[]) {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Extract categories from notes
  useEffect(() => {
    const categories = extractCategories(notes);
    
    setAvailableCategories(prevCategories => {
      const allCategories = [...new Set([...prevCategories, ...categories])];
      return allCategories.filter(cat => cat && cat.trim() !== '');
    });
  }, [notes]);
  
  // Add a category to availableCategories
  const addCategory = (category: string) => {
    if (!category || category.trim() === '') return;
    
    // Check if category already exists
    if (availableCategories.includes(category.trim())) return;
    
    // Add the new category
    setAvailableCategories(prev => [...prev, category.trim()]);
  };
  
  return {
    availableCategories,
    addCategory
  };
}

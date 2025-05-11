
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubjectCategory } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';

export const useCategoryOperations = (
  categories: SubjectCategory[],
  setCategories: React.Dispatch<React.SetStateAction<SubjectCategory[]>>
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 3;

  // Fetch all subject categories with retry logic
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subject_categories')
        .select('*')
        .order('name');
      
      if (error) {
        // If there's an error and we haven't exceeded max retries
        if (retries < MAX_RETRIES) {
          setRetries(prevRetries => prevRetries + 1);
          console.log(`Retry ${retries + 1}/${MAX_RETRIES} for fetching categories`);
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 500));
          return fetchCategories(); // Retry
        }
        throw error;
      }
      
      // Reset retries on successful fetch
      setRetries(0);
      
      // Organize into hierarchical structure
      const rootCategories: SubjectCategory[] = [];
      const categoriesById: Record<string, SubjectCategory & {subcategories: SubjectCategory[]}> = {};
      
      // First pass: index all categories by ID
      if (data) {
        data.forEach(category => {
          categoriesById[category.id] = { ...category, subcategories: [] };
        });
        
        // Second pass: build the tree structure
        data.forEach(category => {
          if (category.parent_id && categoriesById[category.parent_id]) {
            // Add to parent's subcategories
            categoriesById[category.parent_id].subcategories.push(categoriesById[category.id]);
          } else {
            // Root category
            rootCategories.push(categoriesById[category.id]);
          }
        });
      }
      
      setCategories(rootCategories);
      return rootCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Provide more user-friendly error message
      toast({
        title: 'Error fetching categories',
        description: 'Network or server issue. Please check your connection and try again.',
        variant: 'destructive',
      });
      
      // Return empty array as fallback
      return [];
    } finally {
      setLoading(false);
    }
  }, [setCategories, toast, retries]);

  return { fetchCategories, categoriesLoading: loading };
};

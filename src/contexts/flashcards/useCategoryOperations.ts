
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SubjectCategory } from '@/types/flashcard';
import { useToast } from '@/hooks/use-toast';

export const useCategoryOperations = (
  categories: SubjectCategory[],
  setCategories: React.Dispatch<React.SetStateAction<SubjectCategory[]>>
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Fetch all subject categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subject_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Organize into hierarchical structure
      const rootCategories: SubjectCategory[] = [];
      const categoriesById: Record<string, SubjectCategory> = {};
      
      // First pass: index all categories by ID
      data.forEach(category => {
        categoriesById[category.id] = { ...category, subcategories: [] };
      });
      
      // Second pass: build the tree structure
      data.forEach(category => {
        if (category.parent_id) {
          // Add to parent's subcategories
          const parent = categoriesById[category.parent_id];
          if (parent && parent.subcategories) {
            parent.subcategories.push(categoriesById[category.id]);
          }
        } else {
          // Root category
          rootCategories.push(categoriesById[category.id]);
        }
      });
      
      setCategories(rootCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error fetching categories',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return { fetchCategories };
};


import { useCallback } from 'react';
import { SubjectCategory } from '@/types/flashcard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook that provides category-related operations for flashcards
 */
export const useCategoryOperations = (
  categories: SubjectCategory[], 
  setCategories: React.Dispatch<React.SetStateAction<SubjectCategory[]>>
) => {
  
  const fetchCategories = useCallback(async (): Promise<SubjectCategory[]> => {
    try {
      const { data, error } = await supabase
        .from('subject_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setCategories(data);
      return data;
    } catch (error) {
      console.error('fetchCategories: Error fetching subject categories:', error);
      toast.error('Failed to load categories');
      return [];
    }
  }, [setCategories]);

  const createCategory = useCallback(async (name: string, parentId?: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('subject_categories')
        .insert({
          name,
          parent_id: parentId
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      toast.success('Category created successfully');
    } catch (error) {
      console.error('createCategory: Error creating category:', error);
      toast.error('Failed to create category');
    }
  }, [setCategories]);

  const updateCategory = useCallback(async (id: string, name: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('subject_categories')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, name } : cat)
      );
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('updateCategory: Error updating category:', error);
      toast.error('Failed to update category');
    }
  }, [setCategories]);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('subject_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('deleteCategory: Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  }, [setCategories]);

  return {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

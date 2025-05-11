
import { supabase } from '@/integrations/supabase/client';
import { FlashcardSet, CreateFlashcardSetPayload } from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from './types';

export const useFlashcardSets = (state: FlashcardState) => {
  const { setFlashcardSets, setLoading, user } = state;

  // Helper function to convert database response to FlashcardSet
  const convertToFlashcardSet = (data: any): FlashcardSet => {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_built_in: data.is_built_in,
      card_count: data.card_count || 0,
      subject: data.subject,
      topic: data.topic,
      country_id: data.country_id,
      category_id: data.category_id,
      education_system: data.education_system,
      section_id: data.section_id,
      subject_categories: data.subject_categories ? {
        id: data.subject_categories.id,
        name: data.subject_categories.name
      } : undefined
    };
  };

  // Fetch all flashcard sets for the current user
  const fetchFlashcardSets = async (): Promise<FlashcardSet[]> => {
    if (!user) return [];
    
    try {
      setLoading(prev => ({ ...prev, sets: true }));
      
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(id, name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get card counts for each set
      const setsWithCardCounts = await Promise.all(
        data.map(async (set) => {
          const { count, error: countError } = await supabase
            .from('flashcard_set_cards')
            .select('*', { count: 'exact', head: true })
            .eq('set_id', set.id);
          
          // Convert to proper type and add card count
          const formattedSet = convertToFlashcardSet({
            ...set,
            card_count: countError ? 0 : count || 0
          });
          
          return formattedSet;
        })
      );
      
      setFlashcardSets(setsWithCardCounts);
      return setsWithCardCounts;
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
      toast.error('Failed to load flashcard sets');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  // Fetch built-in flashcard sets for the library
  const fetchBuiltInSets = async (): Promise<FlashcardSet[]> => {
    setLoading(prev => ({ ...prev, sets: true }));
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*, subject_categories(id, name)')
        .eq('is_built_in', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get card counts for each set
      const builtInSetsWithCardCounts = await Promise.all(
        data.map(async (set) => {
          const { count, error: countError } = await supabase
            .from('flashcard_set_cards')
            .select('*', { count: 'exact', head: true })
            .eq('set_id', set.id);
          
          // Convert to proper type and add card count
          const formattedSet = convertToFlashcardSet({
            ...set,
            card_count: countError ? 0 : count || 0
          });
          
          return formattedSet;
        })
      );
      
      return builtInSetsWithCardCounts;
    } catch (error) {
      console.error('Error fetching built-in flashcard sets:', error);
      toast.error('Failed to load flashcard sets');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, sets: false }));
    }
  };

  // Create a new flashcard set
  const createFlashcardSet = async (setData: CreateFlashcardSetPayload): Promise<FlashcardSet | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .insert({
          ...setData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      const formattedSet = convertToFlashcardSet(data);
      setFlashcardSets(prev => [formattedSet, ...prev]);
      
      toast.success('Flashcard set created');
      
      return formattedSet;
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      toast.error('Failed to create flashcard set');
      return null;
    }
  };

  // Update an existing flashcard set
  const updateFlashcardSet = async (id: string, setData: Partial<CreateFlashcardSetPayload>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update(setData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setFlashcardSets(prev => 
        prev.map(set => set.id === id ? { ...set, ...setData } : set)
      );
      
      toast.success('Flashcard set updated');
    } catch (error) {
      console.error('Error updating flashcard set:', error);
      toast.error('Failed to update flashcard set');
    }
  };

  // Delete a flashcard set
  const deleteFlashcardSet = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setFlashcardSets(prev => prev.filter(set => set.id !== id));
      
      toast.success('Flashcard set deleted');
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast.error('Failed to delete flashcard set');
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      
      const { data, error } = await supabase
        .from('subject_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      state.setCategories(data);
      return data;
    } catch (error) {
      console.error('Error fetching subject categories:', error);
      toast.error('Failed to load categories');
      return [];
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  return {
    fetchFlashcardSets,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    fetchBuiltInSets,
    fetchCategories
  };
};

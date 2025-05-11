
import { supabase } from '@/integrations/supabase/client';
import { CreateFlashcardSetPayload, FlashcardSet } from '@/types/flashcard';
import { toast } from 'sonner';
import { FlashcardState } from '../types';
import { convertToFlashcardSet } from '../utils/flashcardSetMappers';

/**
 * Create a new flashcard set
 */
export const createFlashcardSet = async (
  state: FlashcardState,
  setData: CreateFlashcardSetPayload
): Promise<FlashcardSet | null> => {
  const { user, setFlashcardSets } = state;
  
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

/**
 * Update an existing flashcard set
 */
export const updateFlashcardSet = async (
  state: FlashcardState,
  id: string, 
  setData: Partial<CreateFlashcardSetPayload>
) => {
  const { user, setFlashcardSets } = state;
  
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

/**
 * Delete a flashcard set
 */
export const deleteFlashcardSet = async (state: FlashcardState, id: string) => {
  const { user, setFlashcardSets } = state;
  
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


import { supabase } from "@/integrations/supabase/client";
import { CreateFlashcardSetPayload, FlashcardSet } from "@/types/flashcard";
import { toast } from "sonner";
import { FlashcardState } from "../types";
import { convertToFlashcardSet } from "../utils/flashcardSetMappers";

export const createFlashcardSet = async (
  state: FlashcardState,
  setData: CreateFlashcardSetPayload
): Promise<FlashcardSet | null> => {
  const { user, setFlashcardSets } = state;
  
  if (!user) return null;
  
  console.log("Creating flashcard set with data:", setData);
  
  try {
    const { data, error } = await supabase
      .from('flashcard_sets')
      .insert({
        name: setData.name,
        description: setData.description,
        subject: setData.subject?.trim() || null, // Ensure subject is properly stored
        topic: setData.topic,
        category_id: setData.category_id,
        country_id: setData.country_id,
        user_id: user.id,
        // Removed is_public and is_built_in as they don't exist in the schema
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating flashcard set:", error);
      throw error;
    }

    console.log("Flashcard set created successfully:", data);
    
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

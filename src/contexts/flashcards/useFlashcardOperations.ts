
import { useState } from "react";
import { Flashcard } from "@/types/flashcard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlashcardState } from "./types";

export function useFlashcardsOperations(state?: FlashcardState) {
  const { setFlashcards, setFlashcardSets } = state || useFlashcardState();
  const [isLoading, setIsLoading] = useState(false);
  
  const addFlashcard = async (flashcardData: {
    front_content: string;
    back_content: string;
    set_id: string;
    subject?: string;
  }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          front_content: flashcardData.front_content,
          back_content: flashcardData.back_content,
          user_id: state?.user?.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Now that we have the flashcard, let's add it to the set
      if (flashcardData.set_id) {
        const { error: setError } = await supabase
          .from('flashcard_set_cards')
          .insert({
            flashcard_id: data.id,
            set_id: flashcardData.set_id,
            position: 0 // Default position
          });
          
        if (setError) {
          console.error("Error linking flashcard to set:", setError);
          toast.error("Created flashcard but failed to add it to the set");
        }
      }
      
      // Add to local state
      setFlashcards(prev => [...prev, data]);
      
      // Update the set count
      if (flashcardData.set_id) {
        await updateSetCount(flashcardData.set_id);
      }
      
      return data;
    } catch (error) {
      console.error("Error adding flashcard:", error);
      toast.error("Failed to add flashcard");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateSetCount = async (setId: string) => {
    try {
      // Get the count directly from the database
      const { count, error: countError } = await supabase
        .from('flashcard_set_cards')
        .select('*', { count: 'exact', head: true })
        .eq('set_id', setId);
        
      if (countError) throw countError;
      
      // Update the set with the new count
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ 
          // We can only update fields that actually exist in the database
          updated_at: new Date().toISOString() 
        })
        .eq('id', setId);
        
      if (error) throw error;
      
      // Update local state
      setFlashcardSets(prev => 
        prev.map(set => 
          set.id === setId ? { ...set, card_count: count || 0 } : set
        )
      );
      
    } catch (error) {
      console.error("Error updating set count:", error);
    }
  };
  
  return {
    addFlashcard,
    isLoading
  };
}

// Add the missing import for useFlashcardState
import { useFlashcardState } from "./useFlashcardState";

// Export the function with the correct name
export { useFlashcardsOperations as useFlashcardOperations };

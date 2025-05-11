
import { useState } from "react";
import { Flashcard, FlashcardSet } from "@/types/flashcard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFlashcardState } from "./useFlashcardState";

export function useFlashcardsOperations() {
  const { setFlashcards, setFlashcardSets } = useFlashcardState();
  const [isLoading, setIsLoading] = useState(false);
  
  const addFlashcard = async (flashcardData: Omit<Flashcard, 'id' | 'created_at'>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          front_content: flashcardData.front_content,
          back_content: flashcardData.back_content,
          set_id: flashcardData.set_id,
          subject: flashcardData.subject,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to local state
      setFlashcards(prev => [...prev, data]);
      
      // Update the set count
      updateSetCount(flashcardData.set_id, 1);
      
      return data;
    } catch (error) {
      console.error("Error adding flashcard:", error);
      toast.error("Failed to add flashcard");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateSetCount = async (setId: string, increment: number) => {
    try {
      // First fetch current set to get current count
      const { data: currentSet, error: fetchError } = await supabase
        .from('flashcard_sets')
        .select('cards_count')
        .eq('id', setId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const newCount = (currentSet.cards_count || 0) + increment;
      
      // Update the count
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ cards_count: newCount })
        .eq('id', setId);
        
      if (error) throw error;
      
      // Update local state
      setFlashcardSets(prev => 
        prev.map(set => 
          set.id === setId ? { ...set, cards_count: newCount } : set
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

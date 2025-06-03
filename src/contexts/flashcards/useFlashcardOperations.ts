
import { useState } from "react";
import { Flashcard } from "@/types/flashcard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlashcardState } from "./types";
import { useFlashcardState } from "./useFlashcardState";

export function useFlashcardOperations(state?: FlashcardState) {
  const fallbackState = useFlashcardState();
  const { setFlashcards, setFlashcardSets, user } = state || fallbackState;
  const [isLoading, setIsLoading] = useState(false);
  
  const addFlashcard = async (flashcardData: {
    front_content: string;
    back_content: string;
    set_id: string;
    subject?: string;
  }) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error("User must be logged in to create flashcards");
      }
      
      console.log("Creating flashcard with data:", flashcardData);
      
      // Create the flashcard first
      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          front_content: flashcardData.front_content,
          back_content: flashcardData.back_content,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating flashcard:", error);
        throw error;
      }
      
      console.log("Flashcard created:", data);
      
      // Now link it to the set
      if (flashcardData.set_id) {
        const { error: setError } = await supabase
          .from('flashcard_set_cards')
          .insert({
            flashcard_id: data.id,
            set_id: flashcardData.set_id,
            position: 0
          });
          
        if (setError) {
          console.error("Error linking flashcard to set:", setError);
          // Don't throw here, the flashcard was created successfully
        }
      }
      
      // Add to local state
      const newFlashcard: Flashcard = {
        ...data,
        front: data.front_content,
        back: data.back_content
      };
      
      setFlashcards(prev => [...prev, newFlashcard]);
      
      // Update the set count
      if (flashcardData.set_id) {
        await updateSetCount(flashcardData.set_id);
      }
      
      return newFlashcard;
    } catch (error) {
      console.error("Error adding flashcard:", error);
      toast.error("Failed to add flashcard");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const addFlashcardToSet = async (flashcardId: string, setId: string, position?: number) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('flashcard_set_cards')
        .insert({
          flashcard_id: flashcardId,
          set_id: setId,
          position: position || 0
        });
        
      if (error) {
        console.error("Error adding flashcard to set:", error);
        toast.error("Failed to add flashcard to set");
        throw error;
      }
      
      await updateSetCount(setId);
      
    } catch (error) {
      console.error("Error adding flashcard to set:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchFlashcards = async () => {
    return [];
  };
  
  const createFlashcard = async (cardData: any) => {
    return addFlashcard({
      front_content: cardData.front_content || cardData.front,
      back_content: cardData.back_content || cardData.back,
      set_id: cardData.set_id || "",
      subject: cardData.subject
    });
  };
  
  const updateFlashcard = async (id: string, cardData: any) => {
    // Implementation to update a flashcard
  };
  
  const deleteFlashcard = async (id: string) => {
    // Implementation to delete a flashcard
  };
  
  const removeFlashcardFromSet = async (flashcardId: string, setId: string) => {
    // Implementation to remove a flashcard from a set
  };
  
  const updateSetCount = async (setId: string) => {
    try {
      const { count, error: countError } = await supabase
        .from('flashcard_set_cards')
        .select('*', { count: 'exact', head: true })
        .eq('set_id', setId);
        
      if (countError) throw countError;
      
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
    isLoading,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    removeFlashcardFromSet,
    addFlashcardToSet
  };
}

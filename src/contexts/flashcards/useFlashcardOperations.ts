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
          throw setError; // Throw the error to prevent incomplete creation
        }
        
        console.log("Flashcard linked to set successfully");
      }
      
      // Add to local state
      const newFlashcard: Flashcard = {
        ...data,
        front: data.front_content,
        back: data.back_content
      };
      
      setFlashcards(prev => [...prev, newFlashcard]);
      
      // Update the set count and wait for it to complete
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
  
  const fetchFlashcards = async (filters?: { setId?: string }) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        console.log("No user, returning empty array");
        return [];
      }

      console.log("Fetching flashcards for user:", user.id, "with filters:", filters);

      let query = supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // If setId filter is provided, join with flashcard_set_cards
      if (filters?.setId) {
        const { data: setCards, error: setError } = await supabase
          .from('flashcard_set_cards')
          .select(`
            flashcard_id,
            position,
            flashcards (*)
          `)
          .eq('set_id', filters.setId)
          .order('position', { ascending: true });

        if (setError) {
          console.error("Error fetching flashcards for set:", setError);
          throw setError;
        }

        const flashcards: Flashcard[] = (setCards || [])
          .filter(card => card.flashcards)
          .map(card => {
            const flashcard = card.flashcards;
            return {
              ...flashcard,
              front: flashcard.front_content,
              back: flashcard.back_content,
              set_id: filters.setId,
              position: card.position
            };
          });

        console.log("Fetched flashcards for set:", flashcards);
        setFlashcards(flashcards);
        return flashcards;
      }

      // Fetch all flashcards for the user
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching flashcards:", error);
        throw error;
      }

      const flashcards: Flashcard[] = (data || []).map(card => ({
        ...card,
        front: card.front_content,
        back: card.back_content
      }));

      console.log("Fetched all flashcards:", flashcards);
      setFlashcards(flashcards);
      return flashcards;
      
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error("Failed to load flashcards");
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  const createFlashcard = async (cardData: any) => {
    console.log("createFlashcard called with:", cardData);
    
    if (!cardData.set_id) {
      throw new Error("set_id is required to create a flashcard");
    }
    
    // Ensure we have the required fields and use set_id directly
    return addFlashcard({
      front_content: cardData.front_content || cardData.front,
      back_content: cardData.back_content || cardData.back,
      set_id: cardData.set_id, // Use set_id directly from the payload
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
      console.log(`Updating count for set ${setId}...`);
      
      const { count, error: countError } = await supabase
        .from('flashcard_set_cards')
        .select('*', { count: 'exact', head: true })
        .eq('set_id', setId);
        
      if (countError) {
        console.error("Error getting count:", countError);
        throw countError;
      }
      
      const newCount = count || 0;
      console.log(`Updating set ${setId} count to:`, newCount);
      
      // Update local state
      setFlashcardSets(prev => {
        const updated = prev.map(set => 
          set.id === setId ? { ...set, card_count: newCount } : set
        );
        console.log('Updated flashcard sets state:', updated);
        return updated;
      });
      
      return newCount;
      
    } catch (error) {
      console.error("Error updating set count:", error);
      throw error;
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

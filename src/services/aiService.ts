
import { supabase } from "@/integrations/supabase/client";
import { Flashcard } from "@/types/flashcard";

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

export const generateFlashcardsFromNotes = async (
  noteContent: string,
  count: number = 5,
  subject?: string
): Promise<GeneratedFlashcard[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-flashcards', {
      body: { noteContent, count, subject }
    });

    if (error) {
      console.error('Error generating flashcards:', error);
      throw new Error(error.message);
    }

    return data.flashcards || [];
  } catch (error) {
    console.error('Error calling generate-flashcards function:', error);
    throw error;
  }
};

export const getExplanationForCard = async (
  flashcard: Flashcard
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-explanation', {
      body: {
        front: flashcard.front_content,
        back: flashcard.back_content
      }
    });

    if (error) {
      console.error('Error generating explanation:', error);
      throw new Error(error.message);
    }

    return data.explanation || "No explanation available.";
  } catch (error) {
    console.error('Error calling generate-explanation function:', error);
    throw error;
  }
};

export default {
  generateFlashcardsFromNotes,
  getExplanationForCard
};

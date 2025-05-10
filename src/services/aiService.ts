
import { supabase } from "@/integrations/supabase/client";
import { Flashcard } from "@/types/flashcard";
import { toast } from 'sonner';

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
      toast("Failed to generate flashcards", {
        description: error.message || "Please try again later"
      });
      throw new Error(error.message);
    }

    if (!data || !data.flashcards) {
      toast("Invalid response", {
        description: "The server returned an invalid response"
      });
      throw new Error('Invalid response from server');
    }

    return data.flashcards || [];
  } catch (error) {
    console.error('Error calling generate-flashcards function:', error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    toast("Error generating flashcards", {
      description: message
    });
    throw error;
  }
};

export const getExplanationForCard = async (
  flashcard: Flashcard
): Promise<string> => {
  try {
    if (!flashcard.front_content || !flashcard.back_content) {
      toast("Incomplete flashcard", {
        description: "Flashcard content is missing"
      });
      throw new Error('Flashcard content is missing');
    }

    const { data, error } = await supabase.functions.invoke('generate-explanation', {
      body: {
        front: flashcard.front_content,
        back: flashcard.back_content
      }
    });

    if (error) {
      console.error('Error generating explanation:', error);
      toast("Failed to generate explanation", {
        description: error.message || "Please try again later"
      });
      throw new Error(error.message);
    }

    if (!data || !data.explanation) {
      toast("Invalid response", {
        description: "The server returned an invalid response"
      });
      throw new Error('Invalid response from server');
    }

    return data.explanation || "No explanation available.";
  } catch (error) {
    console.error('Error calling generate-explanation function:', error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    toast("Error generating explanation", {
      description: message
    });
    throw error;
  }
};

export default {
  generateFlashcardsFromNotes,
  getExplanationForCard
};

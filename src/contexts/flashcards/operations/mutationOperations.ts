
import { supabase } from "@/integrations/supabase/client";
import { CreateFlashcardSetPayload } from "@/types/flashcard";

export const createFlashcardSet = async (setData: CreateFlashcardSetPayload) => {
  console.log("Creating flashcard set with data:", setData);
  
  const { data, error } = await supabase
    .from('flashcard_sets')
    .insert({
      name: setData.name,
      description: setData.description,
      subject: setData.subject,
      topic: setData.topic,
      category_id: setData.category_id,
      country_id: setData.country_id,
      // Removed is_public and is_built_in as they don't exist in the schema
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating flashcard set:", error);
    throw error;
  }

  console.log("Flashcard set created successfully:", data);
  return data;
};

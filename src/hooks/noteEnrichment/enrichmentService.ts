
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from './types';

export const enrichNote = async (note: Note, enhancementType: EnhancementFunction): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('enrich-note', {
      body: {
        noteContent: note.content || note.description,
        enhancementType: enhancementType,
        noteTitle: note.title,
        noteCategory: note.category
      },
    });

    if (error) {
      throw new Error(`Error invoking enrichment function: ${error.message}`);
    }

    if (!data || !data.enhancedContent) {
      throw new Error('No enhanced content returned from the function');
    }

    // Update the usage tracking
    await trackUsage(note.id);

    return data.enhancedContent;
  } catch (error) {
    console.error("Error during note enrichment:", error);
    throw error;
  }
};

// Track usage of the enrichment feature
export const trackUsage = async (noteId: string) => {
  const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    console.error('Cannot track usage: No authenticated user found');
    return;
  }
  
  const { error } = await supabase
    .from('note_enrichment_usage')
    .insert({
      user_id: userId,
      month_year: currentMonth,
      note_id: noteId,
      llm_provider: 'openai', // Default provider
      prompt_tokens: 0,       // Default values since we don't have this info
      completion_tokens: 0    // Default values since we don't have this info
    });
  
  if (error) {
    console.error('Error tracking usage:', error);
  }
};

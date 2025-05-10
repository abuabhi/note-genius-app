
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from '../useNoteEnrichment';

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
    await trackUsage();

    return data.enhancedContent;
  } catch (error) {
    console.error("Error during note enrichment:", error);
    throw error;
  }
};

// Track usage of the enrichment feature
const trackUsage = async () => {
  const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
  
  const { error } = await supabase
    .from('note_enrichment_usage')
    .insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      month_year: currentMonth
    });
  
  if (error) {
    console.error('Error tracking usage:', error);
  }
};

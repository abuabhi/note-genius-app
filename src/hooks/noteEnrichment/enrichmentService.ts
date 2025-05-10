
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from './types';

export const enrichNote = async (note: Note, enhancementType: EnhancementFunction): Promise<string> => {
  try {
    console.log(`Calling enrich-note function with type: ${enhancementType}, noteId: ${note.id}`);
    
    const { data, error } = await supabase.functions.invoke('enrich-note', {
      body: {
        noteId: note.id,
        noteContent: note.content || note.description,
        enhancementType: enhancementType,
        noteTitle: note.title,
        noteCategory: note.category
      },
    });

    if (error) {
      console.error("Error invoking enrichment function:", error);
      throw new Error(`Error invoking enrichment function: ${error.message}`);
    }

    if (!data || !data.enhancedContent) {
      console.error("No enhanced content returned:", data);
      throw new Error('No enhanced content returned from the function');
    }

    console.log("Enhanced content received, length:", data.enhancedContent.length);
    
    // Update the usage tracking
    await trackUsage(note.id, data.tokenUsage);

    return data.enhancedContent;
  } catch (error) {
    console.error("Error during note enrichment:", error);
    throw error;
  }
};

// Track usage of the enrichment feature
export const trackUsage = async (noteId: string, tokenUsage?: { prompt_tokens: number, completion_tokens: number, total_tokens: number }) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      console.error('Cannot track usage: No authenticated user found');
      return;
    }
    
    console.log(`Tracking usage for user ${userId}, note ${noteId}, month ${currentMonth}`);
    
    const { error } = await supabase
      .from('note_enrichment_usage')
      .insert({
        user_id: userId,
        month_year: currentMonth,
        note_id: noteId,
        llm_provider: 'openai',
        prompt_tokens: tokenUsage?.prompt_tokens || 0,
        completion_tokens: tokenUsage?.completion_tokens || 0
      });
    
    if (error) {
      console.error('Error tracking usage:', error);
    } else {
      console.log('Usage tracking successful');
    }
  } catch (error) {
    console.error('Error in trackUsage:', error);
  }
};

// Generate a summary specifically for a note card (150 characters max)
export const generateNoteSummary = async (note: Note): Promise<string> => {
  try {
    // Check if we already have a recent summary (less than a day old)
    if (note.summary && note.summary_generated_at) {
      const lastGenerated = new Date(note.summary_generated_at);
      const now = new Date();
      // If less than 24 hours and content hasn't changed, return existing summary
      if ((now.getTime() - lastGenerated.getTime()) < 24 * 60 * 60 * 1000) {
        return note.summary;
      }
    }
    
    // Generate a new summary
    const summary = await enrichNote(note, 'summarize');
    
    // Truncate to 150 characters
    return summary.length > 150 ? summary.substring(0, 147) + '...' : summary;
  } catch (error) {
    console.error('Error generating note summary:', error);
    throw error;
  }
};

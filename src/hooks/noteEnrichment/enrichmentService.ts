
import { Note } from "@/types/note";
import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from './types';

interface NoteForEnrichment {
  id: string;
  title: string;
  content?: string; // Make content optional to match Note type
  category?: string;
}

interface EnrichmentResponse {
  enhancedContent: string;
  enhancementType: EnhancementFunction;
  tokenUsage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }
}

export const enrichNote = async (note: NoteForEnrichment, enhancementType: EnhancementFunction): Promise<string> => {
  try {
    console.log(`Calling enrich-note function with type: ${enhancementType}, noteId: ${note.id}`);
    
    // Check if content exists and is not empty
    if (!note.content || note.content.trim() === '') {
      throw new Error('Cannot enrich note: Note content is empty or undefined');
    }
    
    const { data, error } = await supabase.functions.invoke('enrich-note', {
      body: {
        noteId: note.id,
        noteContent: note.content,
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
    
    // Update the usage tracking to include token usage
    await trackUsage(note.id, data.tokenUsage);

    return data.enhancedContent;
  } catch (error) {
    console.error("Error during note enrichment:", error);
    throw error;
  }
};

// Track usage of the enrichment feature, now with token usage
export const trackUsage = async (noteId: string, tokenUsage?: { prompt_tokens: number, completion_tokens: number, total_tokens: number }) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) {
      console.error('Cannot track usage: No authenticated user found');
      return;
    }
    
    // Check if user has reached their monthly limit
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('user_tier')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error getting user tier:', userError);
      return;
    }
    
    // Get tier limits
    const { data: tierData, error: tierError } = await supabase
      .from('tier_limits')
      .select('note_enrichment_limit_per_month')
      .eq('tier', userData.user_tier)
      .single();
    
    if (tierError) {
      console.error('Error getting tier limits:', tierError);
      return;
    }
    
    // Get current usage
    const { data: usageData, error: usageError } = await supabase
      .from('note_enrichment_usage')
      .select('id')
      .eq('user_id', userId)
      .eq('month_year', currentMonth);
    
    if (usageError) {
      console.error('Error getting current usage:', usageError);
      return;
    }
    
    // Check if we're at the limit (skip this check if tierData.note_enrichment_limit_per_month is null)
    if (tierData.note_enrichment_limit_per_month !== null && 
        usageData.length >= tierData.note_enrichment_limit_per_month) {
      console.error('Monthly limit reached for user:', userId);
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
    
    // Verify note has content before attempting to generate summary
    if (!note.content || note.content.trim() === '') {
      throw new Error('Cannot generate summary: Note content is empty or undefined');
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


import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from "./types";
import { trackTokenUsage } from "./tokenTracking";

/**
 * Calls the edge function to enrich a note with AI
 * @param note The note to enrich
 * @param enhancementType The type of enhancement to perform
 */
export const callEnrichmentAPI = async (
  note: { 
    id: string; 
    title?: string; 
    content?: string;
    category?: string;
  },
  enhancementType: EnhancementFunction
): Promise<string> => {
  console.log(`Enriching note with ${enhancementType}`);
  
  // If the note doesn't have content, throw an error
  if (!note.content) {
    throw new Error('No content to enhance');
  }
  
  try {
    // Set reasonable timeout for the function call with AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('Enhancement request timed out after 90 seconds');
      controller.abort();
    }, 90000); // 90 second timeout
    
    console.log('Calling enrich-note function...');
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('enrich-note', {
      body: {
        noteId: note.id,
        noteTitle: note.title || 'Untitled Note',
        noteContent: note.content,
        enhancementType
      }
    });
    
    clearTimeout(timeoutId);
    
    if (controller.signal.aborted) {
      throw new Error('Request timed out. The AI service may be experiencing delays. Please try again.');
    }
    
    if (error) {
      console.error('Error calling enrich-note function:', error);
      throw new Error('Failed to enrich note: ' + error.message);
    }
    
    if (!data?.enhancedContent) {
      throw new Error('No enhanced content returned from AI service');
    }
    
    console.log('Enhancement completed successfully');
    
    // Return the content directly
    const enhancedContent = data.enhancedContent.trim();
    
    // Track token usage (if available) to calculate usage limits
    if (data.tokenUsage) {
      try {
        await trackTokenUsage(note.id, data.tokenUsage);
      } catch (trackError) {
        // Continue even if tracking fails - don't block the main flow
        console.error('Error tracking token usage:', trackError);
      }
    }

    return enhancedContent;
  } catch (error) {
    console.error('Error enriching note:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('aborted')) {
        throw new Error('The AI service is taking longer than expected. Please try again in a moment.');
      }
      if (error.message.includes('network')) {
        throw new Error('Network error occurred. Please check your connection and try again.');
      }
    }
    
    throw error;
  }
};

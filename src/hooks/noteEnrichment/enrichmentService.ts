import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from "./types";

/**
 * Post-process enhanced content to ensure proper formatting
 */
const postProcessEnhancedContent = (content: string, enhancementType: EnhancementFunction): string => {
  switch (enhancementType) {
    case 'extract-key-points':
      // Ensure key points are properly formatted as bullet points
      let processedContent = content.trim();
      
      // If the content doesn't start with bullet points, try to convert it
      if (!processedContent.startsWith('- ')) {
        // Split by sentences or lines and convert to bullet points
        const lines = processedContent.split(/[.\n]/).filter(line => line.trim().length > 0);
        if (lines.length > 1) {
          processedContent = lines.map(line => `- ${line.trim()}`).join('\n');
        } else {
          // If it's still one long text, break it into logical points
          const sentences = processedContent.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
          if (sentences.length > 1) {
            processedContent = sentences.map(sentence => `- ${sentence.trim()}`).join('\n');
          } else {
            // Last resort: just add a bullet point
            processedContent = `- ${processedContent}`;
          }
        }
      }
      
      // Ensure each line starts with a bullet point
      const lines = processedContent.split('\n');
      processedContent = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('- ')) {
          return `- ${trimmed}`;
        }
        return line;
      }).join('\n');
      
      console.log('Post-processed key points:', processedContent);
      return processedContent;
      
    case 'summarize':
      // Ensure proper paragraph spacing for summaries
      let summaryContent = content.trim();
      
      // Replace single line breaks with double line breaks for proper paragraph spacing
      // But preserve existing double line breaks
      summaryContent = summaryContent.replace(/\n(?!\n)/g, '\n\n');
      
      console.log('Post-processed summary with paragraph spacing');
      return summaryContent;
      
    default:
      return content;
  }
};

/**
 * Calls the edge function to enrich a note with AI
 * @param note The note to enrich
 * @param enhancementType The type of enhancement to perform
 */
export const enrichNote = async (
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
    
    // Return the content directly without post-processing
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

/**
 * Track token usage for note enrichments
 */
const trackTokenUsage = async (noteId: string, tokenUsage: { promptTokens: number; completionTokens: number }) => {
  try {
    // Get current month in YYYY-MM format
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get the current authenticated user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found when tracking token usage');
      return;
    }
    
    // Insert usage record
    const { error } = await supabase
      .from('note_enrichment_usage')
      .insert({
        note_id: noteId,
        month_year: currentMonth,
        llm_provider: 'openai',
        prompt_tokens: tokenUsage.promptTokens,
        completion_tokens: tokenUsage.completionTokens,
        user_id: user.id
      });
    
    if (error) {
      console.error('Error tracking token usage:', error);
    }
  } catch (err) {
    console.error('Error tracking token usage:', err);
    // Don't re-throw - this should not block the main process
  }
};

/**
 * Shortcut function for generating note summary
 */
export const generateNoteSummary = async (note: { 
  id: string; 
  title?: string; 
  content?: string;
  category?: string;
}): Promise<string> => {
  return enrichNote(note, 'summarize');
};

/**
 * Shortcut function for extracting key points
 */
export const extractKeyPoints = async (note: { 
  id: string; 
  title?: string; 
  content?: string;
  category?: string;
}): Promise<string> => {
  return enrichNote(note, 'extract-key-points');
};

/**
 * Shortcut function for improving clarity
 */
export const improveClarity = async (note: { 
  id: string; 
  title?: string; 
  content?: string;
  category?: string;
}): Promise<string> => {
  return enrichNote(note, 'improve-clarity');
};

/**
 * Shortcut function for converting to markdown
 */
export const convertToMarkdown = async (note: { 
  id: string; 
  title?: string; 
  content?: string;
  category?: string;
}): Promise<string> => {
  return enrichNote(note, 'convert-to-markdown');
};

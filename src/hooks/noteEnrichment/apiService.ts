
import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from "./types";
import { trackTokenUsage } from "./tokenTracking";

/**
 * Calls the edge function to enrich a note with AI
 * @param note The note to enrich
 * @param enhancementType The type of enhancement to perform
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callEnrichmentAPIWithRetry = async (
  note: { 
    id: string; 
    title?: string; 
    content?: string;
    category?: string;
  },
  enhancementType: EnhancementFunction,
  attempt: number = 1
): Promise<string> => {
  const maxRetries = 2;
  const timeout = 60000; // 60 seconds
  
  console.log(`🚀 Enhancement attempt ${attempt}/${maxRetries + 1}: ${enhancementType} for note ${note.id.substring(0, 8)}`);
  
  try {
    // Call the edge function with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`❌ Enhancement request timed out after ${timeout/1000} seconds`);
      controller.abort();
    }, timeout);
    
    console.log('🔄 Calling enrich-note function...');
    console.log('📋 Request details:', {
      noteId: note.id.substring(0, 8) + '...',
      titleLength: (note.title || '').length,
      contentLength: note.content.length,
      enhancementType,
      attempt,
      timestamp: new Date().toISOString()
    });
    
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
      throw new Error('timeout');
    }
    
    if (error) {
      console.error('❌ Error calling enrich-note function:', error);
      console.error('📄 Full error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    if (!data?.enhancedContent) {
      console.error('No enhanced content in response:', data);
      throw new Error('No enhanced content returned from AI service');
    }
    
    console.log('✅ Enhancement completed successfully:', {
      contentLength: data.enhancedContent.length,
      hasTokenUsage: !!data.tokenUsage,
      enhancementType,
      attempt
    });
    
    // Track token usage (if available)
    if (data.tokenUsage) {
      try {
        await trackTokenUsage(note.id, data.tokenUsage);
      } catch (trackError) {
        console.error('Error tracking token usage:', trackError);
      }
    }

    return data.enhancedContent.trim();
  } catch (error) {
    console.error(`❌ Enhancement attempt ${attempt} failed:`, error);
    
    // Check if we should retry
    const isRetryableError = (
      error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message === 'timeout'
      )
    );
    
    if (isRetryableError && attempt <= maxRetries) {
      console.log(`🔄 Retrying enhancement in ${attempt * 2} seconds... (attempt ${attempt + 1}/${maxRetries + 1})`);
      await sleep(attempt * 2000); // Exponential backoff
      return callEnrichmentAPIWithRetry(note, enhancementType, attempt + 1);
    }
    
    // Final error handling
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message === 'timeout') {
        throw new Error(`Request timed out after ${timeout/1000} seconds. The AI service may be experiencing high load. Please try again.`);
      }
      if (error.message?.includes('quota') || error.message?.includes('limit')) {
        throw new Error('AI service quota exceeded. Please try again later or upgrade your plan.');
      }
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        throw new Error('Network error occurred. Please check your connection and try again.');
      }
    }
    
    throw new Error(`Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
};

export const callEnrichmentAPI = async (
  note: { 
    id: string; 
    title?: string; 
    content?: string;
    category?: string;
  },
  enhancementType: EnhancementFunction
): Promise<string> => {
  // Validate inputs
  if (!note.content) {
    throw new Error('No content to enhance');
  }
  
  return callEnrichmentAPIWithRetry(note, enhancementType, 1);
};

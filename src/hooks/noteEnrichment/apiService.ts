
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
      
      // Extract detailed error information from Supabase response
      let errorMessage = 'API call failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      console.error('🔍 Extracted error message:', errorMessage);
      throw new Error(errorMessage);
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
    
    // Preserve the original error details instead of generic message
    const originalError = error instanceof Error ? error.message : String(error);
    console.error('🔍 Final error being thrown:', originalError);
    throw new Error(originalError);
  }
};

/**
 * Test the health of the enrich-note edge function
 */
export const testEnrichmentHealth = async (): Promise<{ status: string; details: any }> => {
  try {
    console.log('🏥 Testing enrich-note function health...');
    
    const { data, error } = await supabase.functions.invoke('enrich-note/health');
    
    if (error) {
      console.error('❌ Health check failed:', error);
      return { status: 'unhealthy', details: error };
    }
    
    console.log('✅ Health check passed:', data);
    return { status: 'healthy', details: data };
  } catch (error) {
    console.error('❌ Health check exception:', error);
    return { status: 'error', details: error };
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
  
  // Add pre-flight health check for debugging
  console.log('🏥 Running pre-flight health check...');
  const healthCheck = await testEnrichmentHealth();
  console.log('🏥 Health check result:', healthCheck);
  
  return callEnrichmentAPIWithRetry(note, enhancementType, 1);
};

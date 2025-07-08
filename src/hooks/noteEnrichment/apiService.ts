
import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from "./types";
import { trackTokenUsage } from "./tokenTracking";
import { extractErrorMessage, logErrorWithContext } from "@/utils/errorUtils";

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
  const maxRetries = 1; // Reduced retries for faster response
  const timeout = 55000; // 55 seconds to stay under 60s limit
  
  console.log(`🚀 Enhancement attempt ${attempt}/${maxRetries + 1}: ${enhancementType} for note ${note.id.substring(0, 8)}`);
  
  try {
    // Call the edge function with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`❌ Enhancement request timed out after ${timeout/1000} seconds`);
      controller.abort();
    }, timeout);
    
    console.log('🔄 Calling enrich-note function...');
    
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
      throw new Error('Request timed out. Please try with shorter content.');
    }
    
    if (error) {
      logErrorWithContext(error, 'Enhancement API Error', { noteId: note.id, enhancementType });
      
      // Extract clean error message using utility
      const errorInfo = extractErrorMessage(error);
      throw new Error(errorInfo.message);
    }
    
    if (!data?.enhancedContent) {
      throw new Error('No enhanced content returned from AI service');
    }
    
    console.log('✅ Enhancement completed:', data.enhancedContent.length, 'characters');
    
    // Track token usage if available
    if (data.tokenUsage) {
      try {
        await trackTokenUsage(note.id, data.tokenUsage);
      } catch (trackError) {
        console.warn('Token tracking failed:', trackError);
      }
    }

    return data.enhancedContent.trim();
  } catch (error) {
    logErrorWithContext(error, `Enhancement attempt ${attempt} failed`, { noteId: note.id, enhancementType });
    
    // Check if we should retry for network/timeout errors only
    const errorInfo = extractErrorMessage(error);
    const isRetryable = (
      errorInfo.message.includes('timeout') ||
      errorInfo.message.includes('network') ||
      errorInfo.message.includes('fetch') ||
      errorInfo.code === '408' ||
      errorInfo.code === '502' ||
      errorInfo.code === '503'
    );
    
    if (isRetryable && attempt <= maxRetries) {
      console.log(`🔄 Retrying enhancement... (attempt ${attempt + 1}/${maxRetries + 1})`);
      await sleep(2000); // Fixed 2 second wait
      return callEnrichmentAPIWithRetry(note, enhancementType, attempt + 1);
    }
    
    // Use extracted error message
    throw new Error(errorInfo.message);
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
  
  if (note.content.length > 8000) {
    throw new Error('Content too long. Please use shorter text (max 8000 characters).');
  }
  
  return callEnrichmentAPIWithRetry(note, enhancementType, 1);
};


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
  const maxRetries = 2;
  const timeout = 50000; // 50 seconds timeout with buffer
  const requestId = crypto.randomUUID();
  
  console.log(`🚀 [${requestId}] Enhancement attempt ${attempt}/${maxRetries + 1}: ${enhancementType} for note ${note.id.substring(0, 8)}`);
  console.log(`📋 [${requestId}] Request details:`, {
    noteId: note.id.substring(0, 8),
    enhancementType,
    contentLength: note.content?.length || 0,
    hasTitle: !!note.title,
    attempt
  });
  
  try {
    // Validate content before sending
    if (!note.content || note.content.trim() === '') {
      throw new Error('No content to enhance');
    }
    
    // Removed problematic health check - proceeding directly to enhancement call
    
    // Call the edge function with timeout and detailed logging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`❌ [${requestId}] Enhancement request timed out after ${timeout/1000} seconds`);
      controller.abort();
    }, timeout);
    
    console.log(`🔄 [${requestId}] Calling enrich-note function (attempt ${attempt}/${maxRetries + 1})...`);
    
    const requestBody = {
      noteId: note.id,
      noteTitle: note.title || 'Untitled Note',
      noteContent: note.content,
      enhancementType
    };
    
    console.log(`📤 [${requestId}] Sending request body:`, {
      noteId: requestBody.noteId.substring(0, 8),
      noteTitle: requestBody.noteTitle.substring(0, 50),
      noteContentLength: requestBody.noteContent.length,
      enhancementType: requestBody.enhancementType,
      bodySize: JSON.stringify(requestBody).length
    });
    
    const { data, error } = await supabase.functions.invoke('enrich-note', {
      body: requestBody,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📥 [${requestId}] Response received:`, {
      hasData: !!data,
      hasError: !!error,
      dataKeys: data ? Object.keys(data) : [],
      errorType: error ? typeof error : 'none',
      fullError: error,
      fullData: data
    });
    
    if (controller.signal.aborted) {
      throw new Error('Request timed out. Please try with shorter content.');
    }
    
    if (error) {
      logErrorWithContext(error, 'Enhancement API Error', { noteId: note.id, enhancementType, attempt, requestId });
      
      // Extract clean error message using utility
      const errorInfo = extractErrorMessage(error);
      console.error(`❌ [${requestId}] Enhancement API error details:`, {
        errorMessage: errorInfo.message,
        errorCode: errorInfo.code,
        noteId: note.id.substring(0, 8),
        enhancementType,
        attempt,
        fullError: error
      });
      throw new Error(errorInfo.message);
    }
    
    if (!data?.enhancedContent) {
      console.error(`❌ [${requestId}] No enhanced content returned:`, { 
        data: data ? JSON.stringify(data).substring(0, 200) : 'null', 
        noteId: note.id.substring(0, 8), 
        enhancementType 
      });
      throw new Error('No enhanced content returned from AI service');
    }
    
    console.log(`✅ [${requestId}] Enhancement completed successfully:`, {
      noteId: note.id.substring(0, 8),
      enhancementType,
      contentLength: data.enhancedContent.length,
      tokenUsage: data.tokenUsage,
      processingTime: data.processingTime,
      attempt,
      requestId: data.requestId
    });
    
    // Track token usage if available
    if (data.tokenUsage) {
      try {
        await trackTokenUsage(note.id, data.tokenUsage);
        console.log(`📊 Token usage tracked:`, data.tokenUsage);
      } catch (trackError) {
        console.warn('Token tracking failed:', trackError);
      }
    }

    return data.enhancedContent.trim();
  } catch (error) {
    logErrorWithContext(error, `Enhancement attempt ${attempt} failed`, { noteId: note.id, enhancementType, attempt, requestId });
    
    // Check if we should retry for network/timeout errors only
    const errorInfo = extractErrorMessage(error);
    const isRetryable = (
      errorInfo.message.includes('timeout') ||
      errorInfo.message.includes('network') ||
      errorInfo.message.includes('fetch') ||
      errorInfo.message.includes('abort') ||
      errorInfo.code === '408' ||
      errorInfo.code === '502' ||
      errorInfo.code === '503' ||
      errorInfo.code === '504'
    );
    
    console.log(`🔍 [${requestId}] Error analysis:`, {
      noteId: note.id.substring(0, 8),
      enhancementType,
      attempt,
      isRetryable,
      errorMessage: errorInfo.message,
      errorCode: errorInfo.code,
      willRetry: isRetryable && attempt <= maxRetries,
      requestId
    });
    
    if (isRetryable && attempt <= maxRetries) {
      console.log(`🔄 [${requestId}] Retrying enhancement... (attempt ${attempt + 1}/${maxRetries + 1})`);
      await sleep(2000 * attempt); // Exponential backoff: 2s, 4s
      return callEnrichmentAPIWithRetry(note, enhancementType, attempt + 1);
    }
    
    // Use extracted error message for better user experience
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
  
  // No character limit - let the edge function handle chunking for large content
  return callEnrichmentAPIWithRetry(note, enhancementType, 1);
};

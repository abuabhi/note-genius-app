// Enhanced API service with clean debugging architecture
import { supabase } from '@/integrations/supabase/client';
import { debugLogger } from '@/utils/debug/EnhancementDebugLogger';
import { DEBUG_CONFIG } from '@/config/debug';

export const callEnrichmentAPI = async (
  noteId: string,
  content: string,
  enhancementType: string,
  title?: string
) => {
  debugLogger.logNetworkCall('enrich-note', 'POST', { 
    enhancementType, 
    noteId, 
    contentLength: content.length 
  });

  try {
    // PHASE 1: Health check if debugging enabled
    if (DEBUG_CONFIG.NETWORK_LOGGING) {
      debugLogger.logFlow("TESTING_EDGE_FUNCTION_HEALTH", { noteId, enhancementType });
      
      // Test edge function accessibility with minimal request
      try {
        const healthCheck = await supabase.functions.invoke('enrich-note', {
          body: { test: 'health-check' }
        });
        debugLogger.logFlow("HEALTH_CHECK_RESULT", { 
          status: healthCheck.error ? 'FAILED' : 'SUCCESS',
          error: healthCheck.error?.message 
        });
      } catch (healthError) {
        debugLogger.logError("HEALTH_CHECK_FAILED", { 
          error: healthError instanceof Error ? healthError.message : 'Unknown error'
        });
      }
    }

    // Main enrichment call
    debugLogger.logFlow("CALLING_SUPABASE_FUNCTION", { 
      function: 'enrich-note',
      noteId,
      enhancementType 
    });

    const { data, error } = await supabase.functions.invoke('enrich-note', {
      body: {
        noteId,
        content,
        enhancementType,
        title
      }
    });

    if (error) {
      debugLogger.logError("SUPABASE_FUNCTION_ERROR", { 
        error: error.message,
        noteId,
        enhancementType 
      });
      debugLogger.logNetworkCall('enrich-note', 'POST', { enhancementType }, 500);
      return { success: false, error: error.message };
    }

    debugLogger.logFlow("SUPABASE_FUNCTION_SUCCESS", { 
      data: data ? 'received' : 'empty',
      noteId,
      enhancementType 
    });
    debugLogger.logNetworkCall('enrich-note', 'POST', { enhancementType }, 200);

    return { success: true, data };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    debugLogger.logError("API_CALL_CATCH_ERROR", { 
      error: errorMessage,
      noteId,
      enhancementType 
    });
    debugLogger.logNetworkCall('enrich-note', 'POST', { enhancementType }, 500);
    
    return { success: false, error: errorMessage };
  }
};
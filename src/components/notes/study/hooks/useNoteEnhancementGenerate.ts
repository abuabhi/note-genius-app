
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Note } from "@/types/note";
import { debugLogger } from "@/utils/debug/EnhancementDebugLogger";
import { DEBUG_CONFIG } from "@/config/debug";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancementCache } from "@/hooks/performance/useEnhancementCache";
import { useQueryDeduplication } from "@/hooks/notes/useQueryDeduplication";
import { useProductionMetrics } from "@/hooks/performance/useProductionMetrics";

/**
 * Hook for handling note enhancement generation functionality with stuck state recovery
 */
export const useNoteEnhancementGenerate = (currentNote: Note, forceRefresh: () => void) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [enhancementStartTime, setEnhancementStartTime] = useState<number | null>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize caching and performance monitoring
  const { 
    getCachedEnhancement, 
    setCachedEnhancement, 
    shouldCache,
    getCacheStats,
    clearCache 
  } = useEnhancementCache();
  const { deduplicateQuery, getActiveQueriesCount } = useQueryDeduplication();
  const { recordMetric } = useProductionMetrics('EnhancementGenerate');

  // CRITICAL FIX: Always reset enhancing state on mount/note change to prevent stuck states
  useEffect(() => {
    setIsEnhancing(false);
    setLastRequestTime(null);
    setRetryCount(0);
    setEnhancementStartTime(null);
    setProcessingTime(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, [currentNote.id]);

  // Real-time progress tracking - updates every 100ms during enhancement
  useEffect(() => {
    if (isEnhancing && enhancementStartTime && !progressTimerRef.current) {
      progressTimerRef.current = setInterval(() => {
        setProcessingTime(Date.now() - enhancementStartTime);
      }, 100);
    }

    if (!isEnhancing && progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    };
  }, [isEnhancing, enhancementStartTime]);

  // Show "taking longer" warning after 20s but don't kill the API call
  useEffect(() => {
    if (isEnhancing && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        console.warn(`⚠️ Enhancement taking longer than expected (20+ seconds)`);
        // Don't reset state - just record the metric for monitoring
        recordMetric('enhancement_slow_warning', 1, { noteId: currentNote.id });
        // The API call continues, just show warning in UI via processingTime
      }, 20000); // 20 second warning (not timeout)
    }

    if (!isEnhancing && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isEnhancing, recordMetric, currentNote.id]);

  // Force reset function for stuck states
  const forceReset = useCallback(() => {
    console.log("🔄 Force resetting enhancement state");
    setIsEnhancing(false);
    setLastRequestTime(null);
    setRetryCount(0);
    setEnhancementStartTime(null);
    setProcessingTime(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    recordMetric('enhancement_force_reset', 1, { noteId: currentNote.id });
    toast.info("Enhancement state reset");
  }, [recordMetric, currentNote.id]);

  // Check if enhancement is stuck (processing for more than 20 seconds)
  const isStuck = lastRequestTime && (Date.now() - lastRequestTime) > 20000;

  const handleGenerateEnhancement = async (enhancementType: string): Promise<void> => {
    const startTime = performance.now();
    const actualStartTime = Date.now();
    
    debugLogger.logFlow("UNIFIED_ENHANCEMENT_HANDLER_CALLED", {
      enhancementType,
      noteId: currentNote.id,
      isEnhancing,
      callStack: 'useNoteEnhancementGenerate.handleGenerateEnhancement'
    });

    if (isEnhancing) {
      debugLogger.logFlow("DUPLICATE_REQUEST_BLOCKED", { noteId: currentNote.id, enhancementType });
      recordMetric('enhancement_duplicate_blocked', 1, { enhancementType });
      return;
    }

    // Check cache first for instant response
    const noteContent = currentNote.content || '';
    if (shouldCache(noteContent)) {
      const cachedResult = getCachedEnhancement(noteContent, enhancementType as any);
      if (cachedResult) {
        console.log(`🎯 Cache hit for ${enhancementType} - instant response!`);
        recordMetric('enhancement_cache_hit', 1, { enhancementType });
        toast.success(`Loaded from cache (0.1s)`, {
          description: `${enhancementType} enhancement ready instantly!`
        });
        // Force refresh to show cached content
        forceRefresh();
        return;
      }
    }
    
    console.log(`⏱️ Starting tab enhancement ${enhancementType} at ${new Date().toISOString()}`);
    debugLogger.logFlow("SETTING_ENHANCING_STATE_TRUE", { noteId: currentNote.id, enhancementType });
    
    // Set timing states for real-time progress
    setIsEnhancing(true);
    setLastRequestTime(actualStartTime);
    setEnhancementStartTime(actualStartTime);
    setProcessingTime(0);
    
    // Record cache miss
    recordMetric('enhancement_cache_miss', 1, { enhancementType });
    
    // Show real-time progress with unique ID for tabs - no timeout, let API complete
    toast.loading(`Processing ${enhancementType}...`, {
      id: `tab-enhancement-${enhancementType}`,
      duration: Infinity, // Let the API call determine completion
      description: "AI is generating your content..."
    });
    
    try {
      console.log(`🚀 Tab Enhancement: Calling test-enhance for ${enhancementType}`);
      
      // Use the fast test-enhance function instead of slow simple-enhance-note
      const enhancementResult = await supabase.functions.invoke('test-enhance', {
        body: {
          text: currentNote.content || ''
        }
      });
      
      const { data, error } = enhancementResult;
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      console.log(`⏱️ Tab Enhancement ${enhancementType} completed in ${duration.toFixed(2)}s`);
      
      // Dismiss loading toast
      toast.dismiss(`tab-enhancement-${enhancementType}`);
      
      debugLogger.logFlow("SIMPLE_ENHANCE_RESULT_RECEIVED", { 
        success: !error, 
        error: error?.message,
        noteId: currentNote.id,
        duration: `${duration.toFixed(2)}s`
      });
      
      if (!error && data?.summary) {
        // Cache successful result for future instant access
        if (shouldCache(noteContent)) {
          setCachedEnhancement(noteContent, enhancementType as any, data.summary || 'Enhanced');
          recordMetric('enhancement_cached', 1, { enhancementType, duration });
        }
        
        // Record performance metrics
        recordMetric('enhancement_success', 1, { 
          enhancementType, 
          duration, 
          contentLength: noteContent.length,
          cacheEnabled: shouldCache(noteContent)
        });
        
        debugLogger.logFlow("ENHANCEMENT_SUCCESS_FORCING_REFRESH", { noteId: currentNote.id });
        toast.success(`Enhancement completed successfully! (${duration.toFixed(1)}s)`, {
          description: `${enhancementType} generated in ${duration.toFixed(1)} seconds`
        });
        forceRefresh();
        // Success - no complex logging needed
      } else {
        const errorMessage = error?.message || data?.error || "Failed to generate enhancement";
        recordMetric('enhancement_error', 1, { 
          enhancementType, 
          error: errorMessage,
          retryCount 
        });
        
        debugLogger.logError("ENHANCEMENT_FAILED", { 
          error: errorMessage, 
          noteId: currentNote.id, 
          enhancementType 
        });
        
        // Offer retry for certain errors
        if (retryCount < 2 && (errorMessage.includes('timeout') || errorMessage.includes('failed'))) {
          setRetryCount(prev => prev + 1);
          toast.error(`${errorMessage}. Retrying... (${retryCount + 1}/2)`);
          setTimeout(() => handleGenerateEnhancement(enhancementType), 2000);
          return;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      recordMetric('enhancement_exception', 1, { 
        enhancementType, 
        error: errorMessage,
        retryCount 
      });
      
      debugLogger.logError("ENHANCEMENT_CATCH_ERROR", { 
        error: errorMessage,
        noteId: currentNote.id,
        enhancementType 
      });
      
      // Dismiss loading toast on error
      toast.dismiss(`tab-enhancement-${enhancementType}`);
      
      // Offer retry for network errors
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        toast.error(`Network error. Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => handleGenerateEnhancement(enhancementType), 2000);
        return;
      }
      
      toast.error("Failed to generate enhancement");
    } finally {
      debugLogger.logFlow("SETTING_ENHANCING_STATE_FALSE", { 
        noteId: currentNote.id
      });
      setIsEnhancing(false);
      setLastRequestTime(null);
      setEnhancementStartTime(null);
      setProcessingTime(0);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
    }
  };

  return {
    handleGenerateEnhancement,
    isEnhancing,
    forceReset,
    isStuck: Boolean(isStuck),
    lastRequestTime,
    retryCount,
    processingTime, // Now tracks real processing time
    enhancementStartTime, // Now tracks actual start time
    // Additional cache and performance methods
    getCacheStats,
    clearCache,
    getActiveQueriesCount
  };
};

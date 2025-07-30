
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Note } from "@/types/note";
import { debugLogger } from "@/utils/debug/EnhancementDebugLogger";
import { DEBUG_CONFIG } from "@/config/debug";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling note enhancement generation functionality with stuck state recovery
 */
export const useNoteEnhancementGenerate = (currentNote: Note, forceRefresh: () => void) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // CRITICAL FIX: Always reset enhancing state on mount/note change to prevent stuck states
  useEffect(() => {
    setIsEnhancing(false);
    setLastRequestTime(null);
    setRetryCount(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [currentNote.id]);

  // Auto-timeout detection for stuck enhancements
  useEffect(() => {
    if (isEnhancing && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        console.warn(`⚠️ Enhancement timeout detected after 30 seconds`);
        setIsEnhancing(false);
        setLastRequestTime(null);
        toast.error("Enhancement timed out. Please try again.");
      }, 30000); // 30 second timeout
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
  }, [isEnhancing]);

  // Force reset function for stuck states
  const forceReset = useCallback(() => {
    console.log("🔄 Force resetting enhancement state");
    setIsEnhancing(false);
    setLastRequestTime(null);
    setRetryCount(0);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    toast.info("Enhancement state reset");
  }, []);

  // Check if enhancement is stuck (processing for more than 2 minutes)
  const isStuck = lastRequestTime && (Date.now() - lastRequestTime) > 120000;

  const handleGenerateEnhancement = async (enhancementType: string): Promise<void> => {
    const startTime = performance.now();
    debugLogger.logFlow("UNIFIED_ENHANCEMENT_HANDLER_CALLED", {
      enhancementType,
      noteId: currentNote.id,
      isEnhancing,
      callStack: 'useNoteEnhancementGenerate.handleGenerateEnhancement'
    });

    if (isEnhancing) {
      debugLogger.logFlow("DUPLICATE_REQUEST_BLOCKED", { noteId: currentNote.id, enhancementType });
      return;
    }
    
    console.log(`⏱️ Starting enhancement ${enhancementType} at ${new Date().toISOString()}`);
    debugLogger.logFlow("SETTING_ENHANCING_STATE_TRUE", { noteId: currentNote.id, enhancementType });
    setIsEnhancing(true);
    setLastRequestTime(Date.now());
    
    try {
      debugLogger.logFlow("CALLING_SIMPLE_ENHANCE_NOTE", {
        noteId: currentNote.id,
        contentLength: currentNote.content?.length || 0,
        enhancementType,
        title: currentNote.title
      });
      
      console.log(`🚀 Tab Enhancement: Calling simple-enhance-note for ${enhancementType}`);
      debugLogger.logNetworkCall('simple-enhance-note', 'POST', { enhancementType, noteId: currentNote.id });
      
      const { data, error } = await supabase.functions.invoke('simple-enhance-note', {
        body: {
          noteId: currentNote.id,
          content: currentNote.content || '',
          enhancementType: enhancementType,
          title: currentNote.title || ''
        }
      });
      
      debugLogger.logFlow("SIMPLE_ENHANCE_RESULT_RECEIVED", { 
        success: !error, 
        error: error?.message,
        noteId: currentNote.id
      });
      
      if (!error && data?.success) {
        debugLogger.logFlow("ENHANCEMENT_SUCCESS_FORCING_REFRESH", { noteId: currentNote.id });
        forceRefresh();
        toast.success("Enhancement generated successfully");
        debugLogger.logNetworkCall('simple-enhance-note', 'POST', { enhancementType }, 200);
      } else {
        const errorMessage = error?.message || data?.error || "Failed to generate enhancement";
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
        debugLogger.logNetworkCall('simple-enhance-note', 'POST', { enhancementType }, 400);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debugLogger.logError("ENHANCEMENT_CATCH_ERROR", { 
        error: errorMessage,
        noteId: currentNote.id,
        enhancementType 
      });
      
      // Offer retry for network errors
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        toast.error(`Network error. Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => handleGenerateEnhancement(enhancementType), 2000);
        return;
      }
      
      toast.error("Failed to generate enhancement");
      debugLogger.logNetworkCall('simple-enhance-note', 'POST', { enhancementType }, 500);
    } finally {
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      console.log(`⏱️ Enhancement ${enhancementType} completed in ${duration.toFixed(2)}s`);
      
      debugLogger.logFlow("SETTING_ENHANCING_STATE_FALSE", { 
        noteId: currentNote.id, 
        duration: `${duration.toFixed(2)}s` 
      });
      setIsEnhancing(false);
      setLastRequestTime(null);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  };

  return {
    handleGenerateEnhancement,
    isEnhancing,
    forceReset,
    isStuck: Boolean(isStuck),
    lastRequestTime,
    retryCount
  };
};

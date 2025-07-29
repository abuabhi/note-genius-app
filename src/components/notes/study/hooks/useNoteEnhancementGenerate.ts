
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Note } from "@/types/note";
import { debugLogger } from "@/utils/debug/EnhancementDebugLogger";
import { DEBUG_CONFIG } from "@/config/debug";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling note enhancement generation functionality
 */
export const useNoteEnhancementGenerate = (currentNote: Note, forceRefresh: () => void) => {
  const [isEnhancing, setIsEnhancing] = useState(false);

  // CRITICAL FIX: Always reset enhancing state on mount/note change to prevent stuck states
  useEffect(() => {
    setIsEnhancing(false);
  }, [currentNote.id]);

  // State logging disabled for cleaner console

  const handleGenerateEnhancement = async (enhancementType: string): Promise<void> => {
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
    
    debugLogger.logFlow("SETTING_ENHANCING_STATE_TRUE", { noteId: currentNote.id, enhancementType });
    setIsEnhancing(true);
    
    try {
      debugLogger.logFlow("CALLING_SIMPLE_ENHANCE_NOTE", {
        noteId: currentNote.id,
        contentLength: currentNote.content?.length || 0,
        enhancementType,
        title: currentNote.title
      });
      
      // Call the new simple-enhance-note edge function
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
        toast.error(errorMessage);
        debugLogger.logNetworkCall('simple-enhance-note', 'POST', { enhancementType }, 400);
      }
    } catch (error) {
      debugLogger.logError("ENHANCEMENT_CATCH_ERROR", { 
        error: error instanceof Error ? error.message : 'Unknown error',
        noteId: currentNote.id,
        enhancementType 
      });
      toast.error("Failed to generate enhancement");
      debugLogger.logNetworkCall('simple-enhance-note', 'POST', { enhancementType }, 500);
    } finally {
      debugLogger.logFlow("SETTING_ENHANCING_STATE_FALSE", { noteId: currentNote.id });
      setIsEnhancing(false);
    }
  };

  return {
    handleGenerateEnhancement,
    isEnhancing
  };
};

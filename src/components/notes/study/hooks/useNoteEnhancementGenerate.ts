
import { useState, useEffect } from "react";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { toast } from "sonner";
import { Note } from "@/types/note";
import { debugLogger } from "@/utils/debug/EnhancementDebugLogger";
import { DEBUG_CONFIG } from "@/config/debug";

/**
 * Hook for handling note enhancement generation functionality
 */
export const useNoteEnhancementGenerate = (currentNote: Note, forceRefresh: () => void) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { enrichNote, hasReachedLimit } = useNoteEnrichment();

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
      hasReachedLimit: hasReachedLimit(),
      callStack: 'useNoteEnhancementGenerate.handleGenerateEnhancement'
    });

    if (hasReachedLimit()) {
      debugLogger.logFlow("ENHANCEMENT_LIMIT_REACHED", { noteId: currentNote.id });
      toast.error("Enhancement limit reached for this month");
      return;
    }

    if (isEnhancing) {
      debugLogger.logFlow("DUPLICATE_REQUEST_BLOCKED", { noteId: currentNote.id, enhancementType });
      return;
    }
    
    debugLogger.logFlow("SETTING_ENHANCING_STATE_TRUE", { noteId: currentNote.id, enhancementType });
    setIsEnhancing(true);
    
    try {
      debugLogger.logFlow("CALLING_ENRICH_NOTE", {
        noteId: currentNote.id,
        contentLength: currentNote.content?.length || 0,
        enhancementType,
        title: currentNote.title
      });
      
      // Call the enrichment service with network logging
      debugLogger.logNetworkCall('enrich-note', 'POST', { enhancementType, noteId: currentNote.id });
      
      const result = await enrichNote(
        currentNote.id,
        currentNote.content || '',
        enhancementType as any,
        currentNote.title
      );
      
      debugLogger.logFlow("ENRICHMENT_RESULT_RECEIVED", { 
        success: result.success, 
        error: result.error,
        noteId: currentNote.id
      });
      
      if (result.success) {
        debugLogger.logFlow("ENHANCEMENT_SUCCESS_FORCING_REFRESH", { noteId: currentNote.id });
        forceRefresh();
        toast.success("Enhancement generated successfully");
        debugLogger.logNetworkCall('enrich-note', 'POST', { enhancementType }, 200);
      } else {
        debugLogger.logError("ENHANCEMENT_FAILED", { 
          error: result.error, 
          noteId: currentNote.id, 
          enhancementType 
        });
        toast.error(result.error || "Failed to generate enhancement");
        debugLogger.logNetworkCall('enrich-note', 'POST', { enhancementType }, 400);
      }
    } catch (error) {
      debugLogger.logError("ENHANCEMENT_CATCH_ERROR", { 
        error: error instanceof Error ? error.message : 'Unknown error',
        noteId: currentNote.id,
        enhancementType 
      });
      toast.error("Failed to generate enhancement");
      debugLogger.logNetworkCall('enrich-note', 'POST', { enhancementType }, 500);
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

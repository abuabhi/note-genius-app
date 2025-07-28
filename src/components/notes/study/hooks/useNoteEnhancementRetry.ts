
import { useState } from "react";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { toast } from "sonner";
import { Note } from "@/types/note";

/**
 * Hook for handling note enhancement retry functionality
 */
export const useNoteEnhancementRetry = (currentNote: Note, forceRefresh: () => void) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { enrichNote, hasReachedLimit } = useNoteEnrichment();

  const handleRetryEnhancement = async (enhancementType: string): Promise<void> => {
    console.log("🔄 RETRY ENHANCEMENT HOOK CALLED:", {
      enhancementType,
      noteId: currentNote.id,
      hasContent: !!currentNote.content,
      noteTitle: currentNote.title
    });
    
    if (hasReachedLimit()) {
      console.log("❌ ENHANCEMENT LIMIT REACHED");
      toast.error("You have reached your monthly limit for note enhancements");
      return;
    }
    
    console.log("🚀 SETTING ENHANCING STATE TO TRUE");
    setIsEnhancing(true);
    
    try {
      console.log("🔧 CALLING enrichNote with:", {
        noteId: currentNote.id,
        contentLength: currentNote.content?.length || 0,
        enhancementType,
        title: currentNote.title
      });
      
      // Call the enrichment service
      const result = await enrichNote(
        currentNote.id,
        currentNote.content || '',
        enhancementType as any,
        currentNote.title
      );
      
      console.log("📋 ENRICHMENT RESULT:", result);
      
      if (result.success) {
        console.log("✅ ENHANCEMENT SUCCESS - FORCING REFRESH");
        // Force immediate refresh
        forceRefresh();
        toast.success("Enhancement regenerated successfully");
      } else {
        console.error("❌ ENHANCEMENT FAILED:", result.error);
        toast.error(result.error || "Failed to regenerate enhancement");
      }
    } catch (error) {
      console.error("❌ CATCH: Error regenerating enhancement:", error);
      toast.error("Failed to regenerate enhancement");
    } finally {
      console.log("🏁 SETTING ENHANCING STATE TO FALSE");
      setIsEnhancing(false);
    }
  };

  return {
    handleRetryEnhancement,
    isEnhancing
  };
};


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
    console.log("🔄 Retrying enhancement:", enhancementType);
    
    if (hasReachedLimit()) {
      toast.error("You have reached your monthly limit for note enhancements");
      return;
    }
    
    setIsEnhancing(true);
    
    try {
      // Call the enrichment service
      const result = await enrichNote(
        currentNote.id,
        currentNote.content || '',
        enhancementType as any,
        currentNote.title
      );
      
      if (result.success) {
        // Force immediate refresh
        forceRefresh();
        toast.success("Enhancement regenerated successfully");
      } else {
        toast.error(result.error || "Failed to regenerate enhancement");
      }
    } catch (error) {
      console.error("❌ Error regenerating enhancement:", error);
      toast.error("Failed to regenerate enhancement");
    } finally {
      setIsEnhancing(false);
    }
  };

  return {
    handleRetryEnhancement,
    isEnhancing
  };
};

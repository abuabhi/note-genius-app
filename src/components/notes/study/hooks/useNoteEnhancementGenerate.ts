
import { useState, useEffect } from "react";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { toast } from "sonner";
import { Note } from "@/types/note";

/**
 * Hook for handling note enhancement generation functionality
 */
export const useNoteEnhancementGenerate = (currentNote: Note, forceRefresh: () => void) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { enrichNote, hasReachedLimit } = useNoteEnrichment();

  // CRITICAL FIX: Always reset enhancing state on mount/note change to prevent stuck states
  useEffect(() => {
    console.log("🔄 COMPREHENSIVE STATE RESET on mount/note change");
    setIsEnhancing(false);
  }, [currentNote.id]);

  console.log("🔍 useNoteEnhancementGenerate COMPREHENSIVE STATE:", {
    noteId: currentNote.id,
    isEnhancing,
    hasReachedLimit: hasReachedLimit(),
    enhancementStatuses: {
      summary: currentNote.summary_status,
      keyPoints: currentNote.key_points_status,
      markdown: currentNote.markdown_content_status,
      questions: currentNote.questions_status,
      enriched: currentNote.enriched_status
    }
  });

  const handleGenerateEnhancement = async (enhancementType: string): Promise<void> => {
    console.log("🔥 UNIFIED ENHANCEMENT HANDLER CALLED:", {
      enhancementType,
      noteId: currentNote.id,
      isEnhancing,
      hasReachedLimit: hasReachedLimit(),
      callStack: 'useNoteEnhancementGenerate.handleGenerateEnhancement'
    });

    if (hasReachedLimit()) {
      console.warn("⚠️ Enhancement limit reached");
      toast.error("Enhancement limit reached for this month");
      return;
    }

    if (isEnhancing) {
      console.warn("⚠️ Already enhancing, skipping duplicate request");
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
        toast.success("Enhancement generated successfully");
      } else {
        console.error("❌ ENHANCEMENT FAILED:", result.error);
        toast.error(result.error || "Failed to generate enhancement");
      }
    } catch (error) {
      console.error("❌ CATCH: Error generating enhancement:", error);
      toast.error("Failed to generate enhancement");
    } finally {
      console.log("🏁 SETTING ENHANCING STATE TO FALSE");
      setIsEnhancing(false);
    }
  };

  return {
    handleGenerateEnhancement,
    isEnhancing
  };
};

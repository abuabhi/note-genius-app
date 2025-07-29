
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

  // CRITICAL FIX: Reset stuck enhancing state on mount/note change
  useEffect(() => {
    console.log("🔄 RESETTING STUCK ENHANCING STATE on mount/note change");
    setIsEnhancing(false);
  }, [currentNote.id]);

  console.log("🔍 useNoteEnhancementGenerate STATE:", {
    noteId: currentNote.id,
    isEnhancing,
    hasReachedLimit: hasReachedLimit()
  });

  const handleGenerateEnhancement = async (enhancementType: string): Promise<void> => {
    console.log("🔄 GENERATE ENHANCEMENT HOOK CALLED:", {
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


import { useEffect } from "react";
import { Note } from "@/types/note";
import { useNotes } from "@/contexts/NoteContext";

/**
 * Hook to prevent automatic summary generation on note load
 */
export const useAutomaticSummaryPrevention = (currentNote: Note, refreshKey: number) => {
  const { updateNote } = useNotes();

  useEffect(() => {
    console.log("📊 NoteStudyView - Enhanced note data tracking:", {
      originalNoteId: currentNote.id,
      timestamp: new Date().toISOString(),
      refreshKey,
      realtimeUpdateCount: refreshKey,
      enhancementTimestamps: {
        summary: currentNote.summary_generated_at,
        keyPoints: currentNote.key_points_generated_at,
        improvedClarity: currentNote.improved_content_generated_at,
        markdown: currentNote.markdown_content_generated_at
      },
      summaryStatus: currentNote.summary_status || 'none',
      rawContentSample: {
        improved_content: currentNote.improved_content?.substring(0, 100) || 'none',
        summary: currentNote.summary?.substring(0, 100) || 'none',
        key_points: currentNote.key_points?.substring(0, 100) || 'none'
      }
    });
    
    // CRITICAL FIX: Reset any stuck summary generation states
    const preventAutomaticSummary = async () => {
      // If summary is stuck in generating or pending state without actual content
      if ((currentNote.summary_status === 'pending' || currentNote.summary_status === 'generating') && 
          refreshKey === 0 && 
          !currentNote.summary) {
        console.log("⚠️ Found stuck summary generation state - resetting to prevent infinite loop");
        
        try {
          await updateNote(currentNote.id, { 
            summary_status: 'completed',
            summary: '' // Clear any pending summary
          });
          console.log("✅ Successfully reset stuck summary state");
        } catch (error) {
          console.error("❌ Failed to reset summary state:", error);
        }
      }
      
      // Also reset if we have a summary but status is still generating/pending
      if ((currentNote.summary_status === 'pending' || currentNote.summary_status === 'generating') && 
          currentNote.summary && 
          currentNote.summary.trim().length > 0) {
        console.log("⚠️ Found completed summary with wrong status - correcting status");
        
        try {
          await updateNote(currentNote.id, { 
            summary_status: 'completed'
          });
          console.log("✅ Successfully corrected summary status");
        } catch (error) {
          console.error("❌ Failed to correct summary status:", error);
        }
      }
    };
    
    preventAutomaticSummary();
  }, [currentNote, refreshKey, updateNote]);
};


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
    
    // CRITICAL FIX: If a note has summary_status of "pending" but it wasn't user-initiated,
    // reset it to prevent automatic generation
    const preventAutomaticSummary = async () => {
      if (currentNote.summary_status === 'pending' && refreshKey === 0) {
        console.log("⚠️ Found pending summary status on note load - resetting to completed to prevent auto-generation");
        // Use 'completed' instead of 'idle' since 'idle' is not a valid status
        await updateNote(currentNote.id, { summary_status: 'completed' });
      }
    };
    
    preventAutomaticSummary();
  }, [currentNote, refreshKey, updateNote]);
};

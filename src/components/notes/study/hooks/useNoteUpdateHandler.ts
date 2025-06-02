
import { Note } from "@/types/note";
import { useNotes } from "@/contexts/NoteContext";

/**
 * Hook for handling note updates with real-time sync
 */
export const useNoteUpdateHandler = (currentNote: Note, forceRefresh: () => void, setRealtimeNote: (note: Note) => void) => {
  const { updateNote } = useNotes();

  const handleNoteUpdate = async (updatedData: Partial<Note>) => {
    try {
      console.log("🎯 NoteStudyView - Handling note update with force refresh:", {
        noteId: currentNote.id,
        updatedFields: Object.keys(updatedData),
        enhancementData: {
          improved_content: updatedData.improved_content?.substring(0, 50) || 'none',
          summary: updatedData.summary?.substring(0, 50) || 'none',
          key_points: updatedData.key_points?.substring(0, 50) || 'none'
        }
      });
      
      await updateNote(currentNote.id, updatedData);
      
      // Force immediate refresh of the component
      forceRefresh();
      
      // Also update local realtime state immediately
      setRealtimeNote(prev => ({ ...prev, ...updatedData }));
      
    } catch (error) {
      console.error("❌ Error updating note:", error);
    }
  };

  return { handleNoteUpdate };
};

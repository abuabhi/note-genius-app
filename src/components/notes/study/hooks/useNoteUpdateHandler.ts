
import { Note } from "@/types/note";
import { useNotes } from "@/contexts/NoteContext";

/**
 * Hook for handling note updates with real-time sync
 */
export const useNoteUpdateHandler = (currentNote: Note) => {
  const { updateNote } = useNotes();

  const handleNoteUpdate = async (updatedData: Partial<Note>) => {
    try {
      console.log("🎯 NoteStudyView - Handling note update:", {
        noteId: currentNote.id,
        updatedFields: Object.keys(updatedData),
        enhancementData: {
          improved_content: updatedData.improved_content?.substring(0, 50) || 'none',
          summary: updatedData.summary?.substring(0, 50) || 'none',
          key_points: updatedData.key_points?.substring(0, 50) || 'none'
        }
      });
      
      await updateNote(currentNote.id, updatedData);
      
    } catch (error) {
      console.error("❌ Error updating note:", error);
    }
  };

  return { handleNoteUpdate };
};


import { useState } from "react";
import { Note } from "@/types/note";
import { NoteDetailsSheet } from "./NoteDetailsSheet";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NoteCard } from "./card/NoteCard";
import { EmptyNotesState } from "./EmptyNotesState";
import { ViewMode } from "@/hooks/useViewPreferences";
import { extractErrorMessage } from "@/utils/errorUtils";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";

interface NotesGridProps {
  notes: Note[];
  viewMode?: ViewMode;
}

export const NotesGrid = ({ notes, viewMode = 'grid' }: NotesGridProps) => {
  // Use OptimizedNotesContext for unified data management
  const { deleteNote, pinNote } = useOptimizedNotes();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();

  if (notes.length === 0) {
    return <EmptyNotesState />;
  }

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      console.log("🔧 [NOTES GRID] Pinning note via OptimizedNotesContext:", id, "New state:", !isPinned);
      await pinNote(id, !isPinned);
      console.log("✅ [NOTES GRID] Note pinned successfully:", id);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("❌ [NOTES GRID] Error pinning note:", { id, error, message: errorMessage.message });
      toast.error(`Failed to update note pin status: ${errorMessage.message}`);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      console.log("🗑️ [NOTES GRID] Deleting note via OptimizedNotesContext:", id);
      await deleteNote(id);
      console.log("✅ [NOTES GRID] Note deleted successfully - UI should update immediately:", id);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("❌ [NOTES GRID] Error deleting note:", { 
        id, 
        error, 
        message: errorMessage.message,
        details: errorMessage.details,
        code: errorMessage.code 
      });
      toast.error(`Failed to delete note: ${errorMessage.message}`);
      throw error;
    }
  };

  const handleNoteClick = (note: Note) => {
    navigate(`/notes/study/${note.id}`);
  };

  const handleShowDetails = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNote(note);
    setIsDetailsOpen(true);
  };

  // Enhanced grid layout for better scaling with many cards
  const gridClasses = viewMode === 'list' 
    ? "flex flex-col space-y-3" 
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <>
      {/* Optimized container for large datasets */}
      <div className="w-full">
        <div className={gridClasses} data-guide="notes-list">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onNoteClick={handleNoteClick}
              onShowDetails={handleShowDetails}
              onPin={handlePin}
              onDelete={handleDelete}
              confirmDelete={null}
              viewMode={viewMode}
            />
          ))}
        </div>
      </div>
      
      {selectedNote && (
        <NoteDetailsSheet 
          note={selectedNote}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onEdit={() => {
            setIsDetailsOpen(false);
            navigate(`/notes/edit/${selectedNote.id}`);
          }}
        />
      )}
    </>
  );
};

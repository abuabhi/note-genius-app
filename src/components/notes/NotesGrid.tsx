
import { useState } from "react";
import { Note } from "@/types/note";
import { useDeleteNoteMutation, usePinNoteMutation } from "@/hooks/queries/useNoteOperations";
import { NoteDetailsSheet } from "./NoteDetailsSheet";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NoteCard } from "./card/NoteCard";
import { EmptyNotesState } from "./EmptyNotesState";
import { ViewMode } from "@/hooks/useViewPreferences";
import { extractErrorMessage } from "@/utils/errorUtils";

interface NotesGridProps {
  notes: Note[];
  viewMode?: ViewMode;
}

export const NotesGrid = ({ notes, viewMode = 'grid' }: NotesGridProps) => {
  // Direct React Query mutations - no context wrapper
  const deleteNoteMutation = useDeleteNoteMutation();
  const pinNoteMutation = usePinNoteMutation();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();

  if (notes.length === 0) {
    return <EmptyNotesState />;
  }

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      console.log("NotesGrid - Pinning note:", id, "New state:", !isPinned);
      await pinNoteMutation.mutateAsync({ id, pinned: !isPinned });
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("NotesGrid - Error pinning note:", { id, error, message: errorMessage.message });
      toast.error(`Failed to update note pin status: ${errorMessage.message}`);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      console.log("NotesGrid - Deleting note:", id);
      await deleteNoteMutation.mutateAsync(id);
      console.log("NotesGrid - Note deleted successfully:", id);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("NotesGrid - Error deleting note:", { 
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

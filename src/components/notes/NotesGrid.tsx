
import { useState } from "react";
import { Note } from "@/types/note";
import { useNotes } from "@/contexts/NoteContext";
import { NoteDetailsSheet } from "./NoteDetailsSheet";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NoteCard } from "./card/NoteCard";
import { EmptyNotesState } from "./EmptyNotesState";

export const NotesGrid = ({ notes }: { notes: Note[] }) => {
  const { pinNote, archiveNote, deleteNote } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (notes.length === 0) {
    return <EmptyNotesState />;
  }

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      await pinNote(id, !isPinned);
      toast.success(isPinned ? "Note unpinned" : "Note pinned");
    } catch (error) {
      console.error("Error pinning note:", error);
      toast.error("Failed to update note pin status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("NotesGrid - Starting deletion for note ID:", id);
      setIsDeletingId(id);
      await deleteNote(id);
      toast.success("Note deleted");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note. Please try again.");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleNoteClick = (note: Note) => {
    // Navigate directly to study mode
    navigate(`/notes/study/${note.id}`);
  };

  const handleShowDetails = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNote(note);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="flex flex-col space-y-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onNoteClick={handleNoteClick}
            onShowDetails={handleShowDetails}
            onPin={handlePin}
            onDelete={handleDelete}
            isDeleting={isDeletingId === note.id}
          />
        ))}
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

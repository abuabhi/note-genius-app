
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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  if (notes.length === 0) {
    return <EmptyNotesState />;
  }

  const handlePin = (id: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    pinNote(id, !isPinned);
    toast(isPinned ? "Note unpinned" : "Note pinned");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If we're already confirming deletion for this note
    if (confirmDelete === id) {
      deleteNote(id);
      setConfirmDelete(null);
      toast("Note deleted");
    } else {
      // First click - set confirm state
      setConfirmDelete(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onNoteClick={handleNoteClick}
            onShowDetails={handleShowDetails}
            onPin={handlePin}
            onDelete={handleDelete}
            confirmDelete={confirmDelete}
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

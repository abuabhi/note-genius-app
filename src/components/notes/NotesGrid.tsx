
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
    deleteNote(id);
    toast("Note deleted");
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

  // Log the notes to help debug
  console.log("Notes in grid:", notes.map(n => ({ id: n.id, title: n.title, subject_id: n.subject_id })));

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
            confirmDelete={null}
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

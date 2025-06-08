
import { Note } from '@/types/note';
import { NoteCard } from '@/components/notes/card/NoteCard';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { NoteDetailsSheet } from '@/components/notes/NoteDetailsSheet';

interface OptimizedNotesGridProps {
  notes: Note[];
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
}

export const OptimizedNotesGrid = ({ notes, onPin, onDelete }: OptimizedNotesGridProps) => {
  const navigate = useNavigate();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (notes.length === 0) {
    return <EmptyNotesState />;
  }

  const handleNoteClick = (note: Note) => {
    navigate(`/notes/${note.id}`);
  };

  const handleShowDetails = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNote(note);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onNoteClick={handleNoteClick}
            onShowDetails={handleShowDetails}
            onPin={onPin}
            onDelete={onDelete}
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

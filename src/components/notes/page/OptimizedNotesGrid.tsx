
import { Note } from '@/types/note';
import { NoteCard } from '@/components/notes/card/NoteCard';
import { CompactNoteCard } from '@/components/notes/card/CompactNoteCard';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { NoteDetailsSheet } from '@/components/notes/NoteDetailsSheet';
import { useViewPreferences } from '@/hooks/useViewPreferences';

interface OptimizedNotesGridProps {
  notes: Note[];
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
}

export const OptimizedNotesGrid = ({ notes, onPin, onDelete }: OptimizedNotesGridProps) => {
  const navigate = useNavigate();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { viewMode } = useViewPreferences('notes');

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

  // Render based on view mode
  if (viewMode === 'card') {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <CompactNoteCard key={note.id} note={note} />
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
  }

  // List view (default)
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

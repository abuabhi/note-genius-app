
import { Note } from '@/types/note';
import { NoteCard } from '@/components/notes/card/NoteCard';
import { CompactNoteCard } from '@/components/notes/card/CompactNoteCard';
import { EmptyNotesState } from '@/components/notes/EmptyNotesState';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { NoteDetailsSheet } from '@/components/notes/NoteDetailsSheet';
import { ViewMode } from '@/hooks/useViewPreferences';

interface OptimizedNotesGridProps {
  notes: Note[];
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  viewMode: ViewMode;
}

export const OptimizedNotesGrid = ({ notes, onPin, onDelete, viewMode }: OptimizedNotesGridProps) => {
  const navigate = useNavigate();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  console.log('🎯 OptimizedNotesGrid - Received viewMode prop:', viewMode);
  console.log('🎯 OptimizedNotesGrid - Notes count:', notes.length);

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

  // Enhanced LIST VIEW with better spacing and animations
  if (viewMode === 'list') {
    console.log('📋 Rendering LIST view');
    return (
      <>
        <div className="flex flex-col space-y-6 max-w-none">
          {notes.map((note, index) => (
            <div 
              key={note.id} 
              className="w-full animate-fade-in transition-all duration-300 hover:scale-[1.01]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <NoteCard
                note={note}
                onNoteClick={handleNoteClick}
                onShowDetails={handleShowDetails}
                onPin={onPin}
                onDelete={onDelete}
                confirmDelete={null}
              />
            </div>
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

  // Enhanced CARD VIEW with improved grid and animations
  console.log('🃏 Rendering CARD view');
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {notes.map((note, index) => (
          <div
            key={note.id}
            className="animate-fade-in transition-all duration-300"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <CompactNoteCard 
              note={note} 
              onPin={onPin}
              onDelete={onDelete}
            />
          </div>
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

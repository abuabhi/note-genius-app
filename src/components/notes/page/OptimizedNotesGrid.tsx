
import { useState } from "react";
import { Note } from "@/types/note";
import { NoteDetailsSheet } from "../NoteDetailsSheet";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ViewMode } from '@/hooks/useViewPreferences';
import { EnhancedNoteCard } from "./EnhancedNoteCard";
import { CompactNoteCard } from "../card/CompactNoteCard";

interface OptimizedNotesGridProps {
  notes: Note[];
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  viewMode: ViewMode;
}

export const OptimizedNotesGrid = ({ 
  notes, 
  onPin, 
  onDelete, 
  viewMode 
}: OptimizedNotesGridProps) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      await onPin(id, isPinned);
    } catch (error) {
      console.error("Error pinning note:", error);
      toast.error("Failed to update note pin status");
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await onDelete(id);
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
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

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter(note => note.pinned);
  const unpinnedNotes = notes.filter(note => !note.pinned);

  const renderNoteCard = (note: Note) => {
    if (viewMode === 'compact') {
      return (
        <CompactNoteCard
          key={note.id}
          note={note}
          onNoteClick={handleNoteClick}
          onShowDetails={handleShowDetails}
          onPin={handlePin}
          onDelete={handleDelete}
          confirmDelete={confirmDelete}
        />
      );
    }

    return (
      <EnhancedNoteCard
        key={note.id}
        note={note}
        onNoteClick={handleNoteClick}
        onShowDetails={handleShowDetails}
        onPin={handlePin}
        onDelete={handleDelete}
        confirmDelete={confirmDelete}
      />
    );
  };

  const gridClasses = viewMode === 'compact' 
    ? "space-y-3" 
    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className="space-y-8">
      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">Pinned Notes</h3>
            <div className="h-px bg-gradient-to-r from-yellow-200 to-transparent flex-1 ml-4"></div>
          </div>
          <div className={gridClasses}>
            {pinnedNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {/* All Notes Section */}
      {unpinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-mint-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">
              {pinnedNotes.length > 0 ? 'All Notes' : 'My Notes'}
            </h3>
            <div className="h-px bg-gradient-to-r from-mint-200 to-transparent flex-1 ml-4"></div>
          </div>
          <div className={gridClasses}>
            {unpinnedNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {/* Note Details Sheet */}
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
    </div>
  );
};

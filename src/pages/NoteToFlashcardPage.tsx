
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import { OptimizedNotesProvider } from "@/contexts/OptimizedNotesContext";
import { FlashcardProvider } from "@/contexts/flashcards";
import { BulkNoteConversion } from "@/components/notes/conversion/BulkNoteConversion";
import { NoteToFlashcardBreadcrumb } from "@/components/notes/conversion/NoteToFlashcardBreadcrumb";
import { Note } from "@/types/note";
import { FlashcardSet } from "@/types/flashcard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const NoteToFlashcardPageContent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const noteId = searchParams.get('noteId');
  const flashcardSetId = searchParams.get('flashcardSetId');
  const { notes, loading } = useOptimizedNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    if (noteId && notes.length > 0) {
      const note = notes.find(n => n.id === noteId);
      setSelectedNote(note || null);
      setIsSearching(false);
    } else if (!loading && notes.length > 0) {
      setIsSearching(false);
    }
  }, [noteId, notes, loading]);

  const handleSuccess = (flashcardSet: FlashcardSet) => {
    // Navigate to the newly created flashcard set
    navigate(`/flashcards/${flashcardSet.id}`);
  };

  const handleCancel = () => {
    // Go back to the previous page or notes list
    if (selectedNote) {
      navigate(`/notes/study/${selectedNote.id}`);
    } else {
      navigate('/notes');
    }
  };

  const renderContent = () => {
    // Show loading state while searching for note
    if (loading || isSearching) {
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </Card>
        </div>
      );
    }

    // Show error state if note not found
    if (noteId && !selectedNote) {
      return (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-foreground mb-2">Note Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The note you're trying to convert could not be found. It may have been deleted or you may not have access to it.
            </p>
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    // Show conversion interface with the full BulkNoteConversion component
    if (selectedNote) {
      return (
        <BulkNoteConversion
          notes={[selectedNote]}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      );
    }

    // Fallback for when no note is selected
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Note Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a note to convert to flashcards.
          </p>
          <button 
            onClick={() => navigate('/notes')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Notes
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Breadcrumb Navigation */}
      <NoteToFlashcardBreadcrumb />
      
      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

const NoteToFlashcardPage = () => {
  return (
    <OptimizedNotesProvider>
      <FlashcardProvider>
        <NoteToFlashcardPageContent />
      </FlashcardProvider>
    </OptimizedNotesProvider>
  );
};

export default NoteToFlashcardPage;

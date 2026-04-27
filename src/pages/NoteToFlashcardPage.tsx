import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { OptimizedNotesProvider, useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import { FlashcardProvider } from "@/contexts/flashcards";
import { useOptimizedNoteStudy } from "@/hooks/notes/useOptimizedNoteStudy";
import { BulkNoteConversion } from "@/components/notes/conversion/BulkNoteConversion";
import { NoteToFlashcardBreadcrumb } from "@/components/notes/conversion/NoteToFlashcardBreadcrumb";
import { Note } from "@/types/note";
import { FlashcardSet } from "@/types/flashcard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="container mx-auto p-4 md:p-6">
    <NoteToFlashcardBreadcrumb />
    {children}
  </div>
);

const LoadingSkeleton = () => (
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

const NotFoundView = ({ onBack }: { onBack: () => void }) => (
  <div className="text-center py-12">
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-foreground mb-2">Note Not Found</h2>
      <p className="text-muted-foreground mb-4">
        The note you're trying to convert could not be found. It may have been deleted or you may not have access to it.
      </p>
      <button
        onClick={onBack}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

const ConversionView = ({ note, onSuccess, onCancel }: { note: Note; onSuccess: (s: FlashcardSet) => void; onCancel: () => void }) => (
  <FlashcardProvider>
    <BulkNoteConversion notes={[note]} onSuccess={onSuccess} onCancel={onCancel} />
  </FlashcardProvider>
);

// Fast path: noteId in URL — fetch the single note directly, skip the notes-list provider.
const SingleNoteFastPath = ({ noteId }: { noteId: string }) => {
  const navigate = useNavigate();
  const { note, isLoading } = useOptimizedNoteStudy(noteId);

  const handleSuccess = (set: FlashcardSet) => navigate(`/flashcards/${set.id}`);
  const handleCancel = () => navigate(note ? `/notes/study/${note.id}` : '/notes');

  if (isLoading && !note) return <Shell><LoadingSkeleton /></Shell>;
  if (!note) return <Shell><NotFoundView onBack={handleCancel} /></Shell>;
  return <Shell><ConversionView note={note} onSuccess={handleSuccess} onCancel={handleCancel} /></Shell>;
};

// Fallback: no noteId — keep the notes-list provider for browse/select flows.
const NoNoteFallback = () => {
  const navigate = useNavigate();
  const { loading } = useOptimizedNotes();
  if (loading) return <Shell><LoadingSkeleton /></Shell>;
  return (
    <Shell>
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Note Selected</h2>
          <p className="text-muted-foreground mb-4">Please select a note to convert to flashcards.</p>
          <button
            onClick={() => navigate('/notes')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Notes
          </button>
        </div>
      </div>
    </Shell>
  );
};

const NoteToFlashcardPage = () => {
  const [searchParams] = useSearchParams();
  const noteId = useMemo(() => searchParams.get('noteId'), [searchParams]);

  if (noteId) {
    // Fast path — no OptimizedNotesProvider, no list query.
    return <SingleNoteFastPath noteId={noteId} />;
  }

  return (
    <OptimizedNotesProvider>
      <NoNoteFallback />
    </OptimizedNotesProvider>
  );
};

export default NoteToFlashcardPage;

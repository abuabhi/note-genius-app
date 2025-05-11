
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotePagination } from "@/components/notes/NotePagination";
import { Note } from "@/types/note";
import { LoadingState } from "./LoadingState";

interface NotesDisplayProps {
  notes: Note[];
  paginatedNotes: Note[];
  loading: boolean;
}

export const NotesDisplay = ({ notes, paginatedNotes, loading }: NotesDisplayProps) => {
  if (loading) {
    return <LoadingState message="Loading your notes..." />;
  }
  
  if (notes.length === 0) {
    return (
      <div className="text-center py-10 bg-mint-50 rounded-lg border border-mint-200 shadow-sm">
        <p className="text-lg text-mint-600 mb-2">No notes found</p>
        <p className="text-sm text-muted-foreground">Create your first note by clicking the "New Note" button above.</p>
      </div>
    );
  }

  return (
    <>
      <NotesGrid notes={paginatedNotes} />
      {notes.length > 0 && <NotePagination />}
    </>
  );
};

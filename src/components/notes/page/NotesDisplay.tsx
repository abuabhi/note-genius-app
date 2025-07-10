
import { NotesGrid } from "@/components/notes/NotesGrid";
import { NotePagination } from "@/components/notes/NotePagination";
import { Note } from "@/types/note";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { NotesEmptyStateRenderer } from "@/components/notes/empty-state/NotesEmptyStateRenderer";

interface NotesDisplayProps {
  notes: Note[];
  paginatedNotes: Note[];
  loading: boolean;
  isFiltered?: boolean;
  activeSubject?: string;
  onCreateNote?: () => void;
  onImportNote?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export const NotesDisplay = ({ 
  notes, 
  paginatedNotes, 
  loading,
  isFiltered = false,
  activeSubject,
  onCreateNote,
  onImportNote,
  error,
  onRetry
}: NotesDisplayProps) => {

  // Show error state if there's an error
  if (error) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/30 rounded-xl blur-xl"></div>
        <div className="relative bg-white/70 backdrop-blur-sm rounded-xl border border-red-100/50 shadow-lg">
          <ErrorState 
            message={`Failed to load notes: ${error}`}
            onRetry={onRetry}
          />
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-mint-200 border-t-mint-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-300 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }
  
  // Show empty state using unified renderer
  if (notes.length === 0) {
    return (
      <NotesEmptyStateRenderer
        notes={notes}
        loading={loading}
        error={error}
        hasActiveFilters={isFiltered}
        selectedSubject={activeSubject || 'all'}
        onCreateNote={onCreateNote}
        onImportNote={onImportNote}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern notes grid with enhanced spacing */}
      <div className="relative">
        <NotesGrid 
          notes={paginatedNotes} 
          viewMode="grid"
          onUpdateNote={async () => {}}
          onDeleteNote={async () => {}}
          loading={false}
        />
      </div>
      
      {/* Enhanced pagination */}
      {notes.length > 0 && (
        <div className="flex justify-center pt-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-mint-100/50 shadow-lg px-6 py-3">
            <NotePagination />
          </div>
        </div>
      )}
    </div>
  );
};
